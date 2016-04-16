using System;
using System.Collections.Generic;
using System.Data.Entity.Core.Common.CommandTrees.ExpressionBuilder;
using System.IO;
using System.Linq;
using System.Web;
using Dexpa.WebSite.Models.Reports;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace Dexpa.WebSite.Controllers
{
    public class ExportToExcel:BasicCustomController
    {
        public MemoryStream CreateExcel<T>(string filename, string reportName, string subHeader, IEnumerable<T> data,
            List<string> skipFields = null)
        {
            string tempFileName = filename;
            var tempFile = new FileInfo(tempFileName);

            using (var excelPackage = new ExcelPackage(tempFile))
            {
                excelPackage.Workbook.Worksheets.Add(reportName);
                ExcelWorksheet worksheet = excelPackage.Workbook.Worksheets[1];
                worksheet.Name = reportName;
                excelPackage.Workbook.Properties.Title = reportName;

                var properties = typeof (T).GetProperties().ToList();

                int columns = properties.Count;
                if (skipFields == null)
                {
                    skipFields = new List<string>();
                }

                columns -= skipFields.Count;

                worksheet.Cells[1, 1].Value = reportName;
                worksheet.Cells[1,1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                worksheet.Cells[2, 1].Value = subHeader;
                worksheet.Cells[2, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                worksheet.Cells[1, 1, 1, columns].Merge = true;
                worksheet.Cells[2, 1, 2, columns].Merge = true;

                var rowNumber = 1;

                foreach (var property in properties)
                {
                        var tableHeaderAttribute = property.GetCustomAttributes(typeof (TableHeaderTextAttribute), true)
                            .Cast<TableHeaderTextAttribute>()
                            .FirstOrDefault();

                    if (tableHeaderAttribute != null)
                    {
                        string value = tableHeaderAttribute.Header;
                        for (int i = 1; i < columns + 1; i++)
                        {
                            rowNumber = 3;
                            if (tableHeaderAttribute.Colspan == 0 && tableHeaderAttribute.Rowspan == 0)
                            {
                                rowNumber = 4;
                            }
                            if (worksheet.Cells[rowNumber, i].Value == "" ||
                                worksheet.Cells[rowNumber, i].Value == null && !worksheet.Cells[rowNumber, i].Merge)
                            {
                                worksheet.Cells[rowNumber, i].Value = value;
                                worksheet.Cells[rowNumber, i].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                worksheet.Cells[rowNumber, i].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                                worksheet.Cells[rowNumber, i].Style.Font.Bold = true;
                                worksheet.Cells[rowNumber, i].AutoFitColumns();
                                if (tableHeaderAttribute.Colspan != 0)
                                {
                                    var Colspan = tableHeaderAttribute.Colspan - 1;
                                    worksheet.Cells[rowNumber, i, rowNumber, i + Colspan].Merge = true;
                                }
                                if (tableHeaderAttribute.Rowspan != 0)
                                {
                                    var Rowspan = tableHeaderAttribute.Rowspan - 1;
                                    while (worksheet.Cells[rowNumber, i].Merge)
                                    {
                                        i++;
                                    }
                                    worksheet.Cells[rowNumber, i, rowNumber + Rowspan, i].Merge = true;
                                }
                                break;
                            }
                            
                        }
                    }
                }

                rowNumber = 5;

                foreach (var row in data)
                {
                    var colNumber = 1;
                    foreach (var property in properties)
                    {
                        if (!skipFields.Contains(property.Name))
                        {
                            var cellParametersAttribute =
                                property.GetCustomAttributes(typeof (CellParametersAttribute), true)
                                    .Cast<CellParametersAttribute>()
                                    .FirstOrDefault();
                            if (cellParametersAttribute != null)
                            {
                                object value = null;
                                if (property.GetValue(row) != null)
                                {
                                    value = property.GetValue(row);
                                }
                                else
                                {
                                    value = "";
                                }
                                worksheet.Cells[rowNumber, colNumber].Value = value.ToString();
                                ExcelHorizontalAlignment alignment = ExcelHorizontalAlignment.Left;
                                switch (cellParametersAttribute.Align)
                                {
                                    case 0:
                                        alignment = ExcelHorizontalAlignment.Left;
                                        break;
                                    case 1:
                                        alignment = ExcelHorizontalAlignment.Center;
                                        break;
                                    case 2:
                                        alignment = ExcelHorizontalAlignment.Right;
                                        break;
                                }
                                worksheet.Cells[rowNumber, colNumber].Style.HorizontalAlignment = alignment;
                                if (property.Name == "DriverName")
                                {
                                    worksheet.Cells[rowNumber, colNumber].AutoFitColumns();
                                }
                                colNumber++;
                            }
                        }
                    }
                    rowNumber++;
                }

                /*excelPackage.Save();
                excelPackage.Dispose();*/

                using (var input = new MemoryStream())
                {
                    var output = new MemoryStream(excelPackage.GetAsByteArray());
                    return output;
                }
            }

            return null;
        }
    }
}