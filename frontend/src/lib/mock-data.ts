export const MOCK_PREGNANT_PATIENTS = 12;
export const MOCK_MONTHLY_REVENUE = 15400; // in local currency
export const MOCK_REVENUE_CURRENCY = 'IQD'; // or $ depending on locale

export type ImportantTask = {
  id: string;
  title: string;
  time: string;
  completed: boolean;
};

export const MOCK_IMPORTANT_TASKS: ImportantTask[] = [
  {
    id: "task-1",
    title: "مراجعة نتائج تحاليل المريضة سارة",
    time: "09:00 صباحاً",
    completed: false,
  },
  {
    id: "task-2",
    title: "التحضير لعملية الولادة القيصرية",
    time: "11:30 صباحاً",
    completed: false,
  },
  {
    id: "task-3",
    title: "الاتصال بالصيدلية لطلب الإمدادات",
    time: "02:00 مساءً",
    completed: true,
  },
  {
    id: "task-4",
    title: "تحديث سجلات المرضى الجدد",
    time: "04:00 مساءً",
    completed: false,
  },
];
