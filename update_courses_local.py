import os
import sys
import json
import time
import pickle
import subprocess
from pathlib import Path


def load_env_file():
    """Load environment variables from .env file if it exists"""
    env_file = Path('.env')
    if env_file.exists():
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    if key and not os.getenv(key):
                        os.environ[key] = value


def run_cmd(cmd, capture=True, check=True):
    """Run a command and return result"""
    result = subprocess.run(
        cmd,
        capture_output=capture,
        text=True,
        check=False
    )
    if check and result.returncode != 0:
        raise subprocess.CalledProcessError(result.returncode, cmd, result.stdout, result.stderr)
    return result


def main():
    """Main function"""
    print("🚀 AISIS Course Updater\n")
    
    # Load .env file
    load_env_file()
    
    # Get period
    period = sys.argv[1] if len(sys.argv) > 1 else os.getenv('APPLICABLE_PERIOD')
    if not period:
        print("❌ No period specified")
        print("   Set APPLICABLE_PERIOD in .env or pass as argument")
        print("   Example: python update_courses_local.py 2024-2\n")
        sys.exit(1)
    
    os.environ['APPLICABLE_PERIOD'] = period
    
    # Check required env vars
    required = ['AISIS_USERNAME', 'AISIS_PASSWORD']
    missing = [var for var in required if not os.getenv(var)]
    if missing:
        print(f"❌ Missing: {', '.join(missing)}")
        print("   Add them to .env file (see env.example)\n")
        sys.exit(1)
    
    print(f"📅 Period: {period}")
    
    # Determine semester string
    try:
        year, suffix = period.split('-')
        year = int(year)
        next_year = year + 1
        
        semester_map = {
            '0': f"Intersession {year}-{next_year}",
            '1': f"First Semester {year}-{next_year}",
            '2': f"Second Semester {year}-{next_year}"
        }
        semester_string = semester_map.get(suffix, "Unknown Semester")
        print(f"📚 {semester_string}\n")
    except:
        print("❌ Invalid period format\n")
        sys.exit(1)
    
    # Pull latest changes FIRST
    print("⬇️  Pulling latest changes...")
    try:
        run_cmd(['git', 'pull', 'origin', 'main'])
        print("✅ Up to date\n")
    except subprocess.CalledProcessError as e:
        print("❌ Failed to pull")
        if "Your local changes" in (e.stderr or ''):
            print("   You have uncommitted changes. Stash or commit them first:")
            print("   git stash  # Save changes temporarily")
            print("   git stash pop  # Restore changes after update")
        print()
        sys.exit(1)
    
    # Install dependencies if needed
    try:
        import requests
        import bs4
    except ImportError:
        print("📦 Installing dependencies...")
        run_cmd([sys.executable, '-m', 'pip', 'install', '-q', 'requests', 'beautifulsoup4'])
        print("✅ Dependencies installed\n")
    
    # Create cookies file
    with open('cookies.pkl', 'wb') as f:
        pickle.dump({}, f)
    
    # Run scraper
    print("🔍 Scraping AISIS...")
    try:
        result = run_cmd([sys.executable, 'aisis_scraper.py'], check=False)
        if result.returncode != 0:
            print("❌ Scraper failed")
            if result.stderr:
                print(result.stderr)
            sys.exit(1)
        
        # Check output
        courses_file = Path('data/courses.json')
        if not courses_file.exists() or courses_file.stat().st_size == 0:
            print("❌ No course data generated\n")
            sys.exit(1)
        
        print("✅ Scraping complete\n")
    finally:
        # Cleanup
        Path('cookies.pkl').unlink(missing_ok=True)
    
    # Update semester info
    print("📝 Updating semester info...")
    timestamp = int(time.time() * 1000)
    Path('data').mkdir(exist_ok=True)
    
    semester_info = {
        'period': period,
        'semesterString': semester_string,
        'lastUpdated': timestamp
    }
    
    with open('data/semester-info.json', 'w', encoding='utf-8') as f:
        json.dump(semester_info, f, indent=2, ensure_ascii=False)
    
    print("✅ Semester info updated\n")
    
    # Check for changes
    result = run_cmd(['git', 'diff', '--quiet'], check=False)
    
    if result.returncode == 0:
        print("ℹ️  No changes detected\n")
        return
    
    # Show what changed
    print("📋 Changes detected:")
    result = run_cmd(['git', 'status', '--short'])
    print(result.stdout)
    
    # Ask to commit
    response = input("💾 Commit and push? (y/n): ").lower()
    if response != 'y':
        print("   Skipped\n")
        return
    
    # Configure git
    run_cmd(['git', 'config', 'user.name', 'Local Script'])
    run_cmd(['git', 'config', 'user.email', 'local@script.com'])
    
    # Commit
    commit_msg = f"""🔄 Auto-update courses for period {period}

- Updated course listings
- Updated semester information
- Semester: {semester_string}
- Timestamp: {timestamp}"""
    
    print("\n📦 Committing...")
    run_cmd(['git', 'add', 'data/courses.json', 'data/semester-info.json'])
    run_cmd(['git', 'commit', '-m', commit_msg])
    print("✅ Committed\n")
    
    # Ask to push
    response = input("⬆️  Push to origin/main? (y/n): ").lower()
    if response != 'y':
        print("   Skipped (changes are committed locally)\n")
        return
    
    print("\n⬆️  Pushing...")
    try:
        run_cmd(['git', 'push', 'origin', 'main'])
        print("✅ Pushed successfully\n")
        print(f"🎉 All done! Updated to {semester_string}\n")
    except subprocess.CalledProcessError:
        print("❌ Push failed")
        print("   Changes are committed locally. Push manually when ready.\n")
        sys.exit(1)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Cancelled by user\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        sys.exit(1)

