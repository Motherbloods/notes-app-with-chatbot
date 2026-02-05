const dummyMessages = {
  1: [
    {
      role: "user",
      content: "Apa itu React?",
    },
    {
      role: "assistant",
      content:
        "React adalah library JavaScript yang digunakan untuk membangun antarmuka pengguna. " +
        "React memungkinkan pengembang untuk membuat komponen UI yang dapat digunakan kembali dan mengelola state aplikasi dengan efisien.",
    },
    {
      role: "user",
      content: "Apa itu useState di React?",
    },
    {
      role: "assistant",
      content:
        "useState adalah hook di React yang memungkinkan komponen fungsional untuk memiliki state. " +
        "Dengan useState, Anda dapat mendeklarasikan variabel state dan fungsi untuk memperbarui nilai state tersebut.",
    },
    {
      role: "user",
      content: "Bagaimana cara menggunakan useState?",
    },
    {
      role: "assistant",
      content:
        "Untuk menggunakan useState, Anda perlu mengimpornya dari React dan memanggilnya di dalam komponen fungsional. " +
        "useState mengembalikan array dengan dua elemen: nilai state saat ini dan fungsi untuk memperbarui nilai tersebut. " +
        "Anda dapat menggunakan destructuring assignment untuk mendapatkan kedua elemen tersebut.",
    },
    {
      role: "user",
      content: "Bisa kasih contoh kode penggunaan useState?",
    },
    {
      role: "assistant",
      content:
        "Tentu! Berikut adalah contoh sederhana penggunaan useState di React:\n\n" +
        "```jsx\n" +
        "import React, { useState } from 'react';\n\n" +
        "function Counter() {\n" +
        "  const [count, setCount] = useState(0);\n\n" +
        "  const increment = () => {\n" +
        "    setCount(count + 1);\n" +
        "  };\n\n" +
        "  return (\n" +
        "    <div>\n" +
        "      <p>Count: {count}</p>\n" +
        "      <button onClick={increment}>Increment</button>\n" +
        "    </div>\n" +
        "  );\n" +
        "}\n\n" +
        "export default Counter;\n" +
        "```",
    },
  ],

  default: [
    {
      role: "user",
      content: "Apa itu JavaScript?",
    },
    {
      role: "assistant",
      content:
        "JavaScript adalah bahasa pemrograman yang digunakan untuk membuat halaman web menjadi interaktif. " +
        "JavaScript dapat digunakan untuk memanipulasi elemen HTML, menangani event, dan berkomunikasi dengan server.",
    },
  ],
};

export default dummyMessages;
