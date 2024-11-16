'use client';

import { useState } from 'react';
import { Clock, Heart, MapPin, Notebook, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

export default function FavoritesPopout({
  favoriteCourses = [],
  onRemoveFavorite = () => {},
}) {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  const FavoritesList = () => (
    <ScrollArea className="h-[calc(100vh-200px)] max-h-[800px] w-full pr-4">
      {favoriteCourses.length === 0 ? (
        <p className="text-center text-gray-400 py-4">
          No favorite courses selected.
        </p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {favoriteCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="relative overflow-hidden bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-start text-gray-100">
                      <span>
                        {course.catNo} - {course.section}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveFavorite(course.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove from favorites</span>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium mb-2 text-gray-200">
                      {course.courseTitle}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>{course.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{course.room}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Notebook className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{course.remarks}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </ScrollArea>
  );

  const FavoritesContent = () => (
    <div className="w-full">
      <Separator className="mb-4 bg-gray-700" />
      <FavoritesList />
    </div>
  );

  return (
    <Sheet open={isFavoritesOpen} onOpenChange={setIsFavoritesOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700 hover:text-gray-100"
        >
          <Heart className="mr-2 h-4 w-4" />
          Favorites ({favoriteCourses.length})
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-[540px] sm:max-w-md bg-gray-900 border-l border-gray-800"
      >
        <SheetHeader>
          <SheetTitle className="text-gray-100">Favorite Courses</SheetTitle>
          <SheetDescription className="text-gray-400">
            Your selected courses are listed below.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 h-full">
          <FavoritesContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
