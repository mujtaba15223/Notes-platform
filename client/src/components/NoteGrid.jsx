import { BookOpen, SearchX } from "lucide-react";
import { NoteCard } from "./NoteCard";

export function NoteGrid({ notes, onDelete, onUpdate, emptyMessage = "No notes found" }) {
  if (!notes || notes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <SearchX className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{emptyMessage}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Try another search or adjust your filters. New shared resources will show up here.
        </p>
        <BookOpen className="mx-auto mt-6 h-5 w-5 text-slate-300" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
      {notes.map((note) => (
        <NoteCard key={note._id} note={note} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
