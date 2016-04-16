using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;
using System.Web.UI.WebControls;
using Dexpa.WebSite.Models.Reports;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace Dexpa.WebSite.Controllers
{
    public class ExportToPDF : BasicCustomController
    {
        public MemoryStream CreatePDF<T>(string reportName, string subHeader, bool landscape, IEnumerable<T> data, List<string> skipFields=null)
        {
            BaseFont baseFont = BaseFont.CreateFont("C:/Windows/Fonts/arial.ttf", BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);
            float fontSize = 13f;
            Font font = new Font(baseFont, fontSize);

            var properties = typeof(T).GetProperties().ToList();

            int columns = properties.Count;

            if (skipFields == null)
            {
                skipFields = new List<string>();
            }

            columns -= skipFields.Count;

            using (var input = new MemoryStream())
            {
                PdfPTable table = new PdfPTable(columns);
                table.WidthPercentage = 100;
                table.LockedWidth = false;
                PdfPCell cell = new PdfPCell();
                cell.VerticalAlignment = PdfPCell.ALIGN_MIDDLE;
                var headerParagraph = new Paragraph
                {
                    new Phrase(reportName + Environment.NewLine + Environment.NewLine, font)
                };
                headerParagraph.Alignment = Element.ALIGN_CENTER;

                fontSize = 11f;
                font = new Font(baseFont, fontSize);

                var subHeaderParagraph = new Paragraph
                {
                    new Phrase(subHeader + Environment.NewLine + Environment.NewLine, font)
                };
                subHeaderParagraph.Alignment = Element.ALIGN_CENTER;
                
                var output = new MemoryStream();

                var document = new Document(PageSize.A4.Rotate(), 10, 10, 10, 10);
                var writer = PdfWriter.GetInstance(document, output);

                writer.CloseStream = false;

                document.Open();

                fontSize = 9f;
                font = new Font(baseFont, fontSize);

                List<PdfPCell> endsCells = new List<PdfPCell>();

                foreach (var property in properties)
                {
                        var tableHeaderAttribute =
                            property.GetCustomAttributes(typeof (TableHeaderTextAttribute), true)
                                .Cast<TableHeaderTextAttribute>()
                                .FirstOrDefault();
                    if (tableHeaderAttribute != null)
                    {
                        string value = tableHeaderAttribute.Header;
                        cell = new PdfPCell(new Phrase(value, font));
                        cell.Colspan = 1;
                        cell.Rowspan = 1;
                        cell.HorizontalAlignment = PdfPCell.ALIGN_CENTER;
                        if (tableHeaderAttribute.Colspan != 0)
                        {
                            cell.Colspan = tableHeaderAttribute.Colspan;
                        }
                        if (tableHeaderAttribute.Rowspan != 0)
                        {
                            cell.Rowspan = tableHeaderAttribute.Rowspan;
                        }
                        if (tableHeaderAttribute.MergedRowspan)
                        {
                            endsCells.Add(cell);
                        }
                        else
                        {
                            table.AddCell(cell);   
                        }
                    
                    }
                }

                if (endsCells.Count > 0)
                {
                    foreach (PdfPCell pCell in endsCells)
                    {
                        table.AddCell(pCell);
                    }
                }

                fontSize = 10f;
                font = new Font(baseFont, fontSize);

                List<float> cellWidths = new List<float>();

                foreach (var row in data)
                {
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
                                    value = property.GetValue(row).ToString();
                                }
                                else
                                {
                                    value = "";
                                }
                                cell = new PdfPCell(new Phrase(value.ToString(), font));
                                cell.HorizontalAlignment = cellParametersAttribute.Align;
                                cell.NoWrap = cellParametersAttribute.Wrap;
                                if (columns > cellWidths.Count)
                                {
                                    cellWidths.Add(cellParametersAttribute.CellWidth);
                                }
                                table.AddCell(cell);
                            }
                        }
                    }
                }
                table.SetWidths(cellWidths.ToArray());
                document.Add(headerParagraph);
                document.Add(subHeaderParagraph);
                document.Add(table);

                document.Close();

                output.Position = 0;

                //return File(output, "application/pdf");
                return output;
            }
        }
    }
}