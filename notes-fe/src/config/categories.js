import { Calendar, Code2, FileText, Lightbulb } from "lucide-react";

const categories = {
  target_harian: {
    icon: Calendar,
    label: "Target Harian",
    color: "text-blue-500",
    link: "/notes/target_harian", // ubah sesuai rute dinamis
  },
  ide: {
    icon: Lightbulb,
    label: "Ide",
    color: "text-yellow-500",
    link: "/notes/ide",
  },
  kode: {
    icon: Code2,
    label: "Kode",
    color: "text-green-500",
    link: "/notes/kode",
  },
  catatan: {
    icon: FileText,
    label: "Catatan",
    color: "text-purple-500",
    link: "/notes/catatan",
  },
};

export default categories;
