import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName) => {
  try {
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
    // Generate Excel file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

export const formatDataForExcel = (data, columns) => {
  return data.map(item => {
    const formattedItem = {};
    columns.forEach(column => {
      if (column.render) {
        formattedItem[column.title] = column.render(item[column.dataIndex], item);
      } else {
        formattedItem[column.title] = item[column.dataIndex];
      }
    });
    return formattedItem;
  });
}; 