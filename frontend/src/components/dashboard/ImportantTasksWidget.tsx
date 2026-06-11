import { CheckCircle2, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportantTask } from "@/lib/mock-data";

type ImportantTasksWidgetProps = {
  tasks: ImportantTask[];
};

export function ImportantTasksWidget({ tasks }: ImportantTasksWidgetProps) {
  return (
    <Card className="rounded-2xl border-slate-100 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <ListTodo className="h-5 w-5 text-emerald-600" />
          </div>
          المهام الهامة
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-6 space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">لا توجد مهام معلقة اليوم.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-start gap-3 p-3 rounded-xl border border-slate-100 transition-all ${
                  task.completed ? "bg-slate-50 opacity-60" : "bg-white hover:border-slate-200 shadow-sm hover:shadow"
                }`}
              >
                <button className={`mt-0.5 shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-400'}`}>
                  <CheckCircle2 className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{task.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
