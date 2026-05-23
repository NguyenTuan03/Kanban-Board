import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

interface Todo {
  id: number;
  name: string;
  created_at?: string;
  is_completed?: boolean;
}

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase.from("todos").select();
  const todos = data as Todo[] | null;

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black text-zinc-900 dark:text-zinc-100 font-sans flex items-center justify-center p-6">
      <main className="w-full max-w-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 p-8 transition-all hover:shadow-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              My Tasks
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Quản lý danh sách công việc của bạn
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
        </header>

        {todos && todos.length > 0 ? (
          <ul className="space-y-3.5">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800/80 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-zinc-300 dark:border-zinc-700 group-hover:border-indigo-500 transition-colors">
                    <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500 scale-0 group-hover:scale-100 transition-transform duration-200" />
                  </div>
                  <span className="text-base font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    {todo.name}
                  </span>
                </div>
                {todo.is_completed !== undefined && (
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      todo.is_completed
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                    }`}
                  >
                    {todo.is_completed ? "Đã xong" : "Chờ xử lý"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl bg-zinc-50/30 dark:bg-zinc-800/10 border border-dashed border-zinc-200 dark:border-zinc-800">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Không có công việc nào hoặc không thể kết nối tới cơ sở dữ liệu.
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Hãy kiểm tra bảng `todos` trên Supabase của bạn.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
