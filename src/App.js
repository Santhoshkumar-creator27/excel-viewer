import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./index.css"; // make sure this is imported

export default function ExcelViewer() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null });

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

  const handleSort = (colIndex) => {
    let direction = "asc";
    if (sortConfig.column === colIndex && sortConfig.direction === "asc") {
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

  const filteredData = data.filter((row, rowIndex) =>
    rowIndex === 0 ||
    row.some((cell) =>
      cell?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="app-container">
      <h1 className="title">📊 Excel Viewer</h1>

      {/* Upload Button */}
      <div className="upload-container">
        <label className="upload-btn">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            hidden
          />
          Upload Excel
        </label>
      </div>

      {/* Search Box */}
      {data.length > 0 && (
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-box"
          />
        </div>
      )}

      {/* Table */}
      {filteredData.length > 0 ? (
        <div className="table-container fade-in">
          <table className="styled-table">
            <thead>
              <tr>
                {filteredData[0].map((header, colIndex) => (
                  <th key={colIndex} onClick={() => handleSort(colIndex)}>
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
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="loading">✨ Upload a file to get started...</div>
      )}
    </div>
  );
}
