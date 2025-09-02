import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelViewer() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null });

  // Handle Excel Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  // Sort Function
  const handleSort = (colIndex) => {
    let direction = "asc";
    if (
      sortConfig.column === colIndex &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ column: colIndex, direction });

    const sortedData = [...data];
    sortedData.slice(1).sort((a, b) => {
      if (a[colIndex] < b[colIndex]) return direction === "asc" ? -1 : 1;
      if (a[colIndex] > b[colIndex]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setData([data[0], ...sortedData.slice(1)]);
  };

  // Filtered Data
  const filteredData = data.filter((row, rowIndex) =>
    rowIndex === 0 ||
    row.some((cell) =>
      cell?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        📊 Excel Viewer
      </h1>

      {/* Upload Button */}
      <div className="flex justify-center mb-6">
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <span className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md transition-transform transform hover:scale-110 hover:bg-blue-700 hover:shadow-xl active:scale-95">
            Upload Excel
          </span>
        </label>
      </div>

      {/* Search Box */}
      {data.length > 0 && (
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="🔍 Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow-sm w-1/2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
      )}

      {/* Table */}
      {filteredData.length > 0 && (
        <div className="overflow-x-auto shadow-lg rounded-lg bg-white p-4 animate-fadeIn">
          <table className="min-w-full border border-gray-300 text-sm text-gray-700">
            <thead>
              <tr className="bg-gray-200">
                {filteredData[0].map((header, colIndex) => (
                  <th
                    key={colIndex}
                    onClick={() => handleSort(colIndex)}
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer hover:bg-gray-300"
                  >
                    {header}{" "}
                    {sortConfig.column === colIndex
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(1).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-100 transition"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-gray-300 px-4 py-2 text-center"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
