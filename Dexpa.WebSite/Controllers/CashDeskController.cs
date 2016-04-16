using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Dexpa.WebSite.Models.Reports;
using Newtonsoft.Json;

namespace Dexpa.WebSite.Controllers
{
    public class CashDeskController : BasicCustomController
    {
        private const string EXPORT_ERROR_MESSAGE = "Нельзя экспортировать пустой отчет";
        //
        // GET: /CashDesk/
        [Authorize(Roles = "Администратор, Кассир, Тех.поддержка")]
        public ActionResult Index()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Кассир, Тех.поддержка")]
        [HttpGet]
        public void ExportReport(string type, string token)
        {
            var api = ConfigurationManager.AppSettings["ApiServer"];
            string url = api + "BalanceReport";
            string json = GetJSON(url, token);

            List<BalanceReport> balanceReport = JsonConvert.DeserializeObject<List<BalanceReport>>(json);

            url = api + "helpdictionaries/DriverStates";
            json = GetJSON(url, token);
            List<DriverState> driverStates = JsonConvert.DeserializeObject<List<DriverState>>(json);

            for (int i = 0; i < balanceReport.Count; i++)
            {
                for (int j = 0; j < driverStates.Count; j++)
                {
                    if (balanceReport[i].DriverState == driverStates[j].State)
                    {
                        balanceReport[i].DriverStateName = driverStates[j].Name;
                    }
                    else
                    {
                        balanceReport[i].DriverStateName = "";
                    }
                }
            }

            List<string> SkipFieldsList = new List<string>();
            SkipFieldsList.Add("DriverState");
            SkipFieldsList.Add("DriverId");

            string reportName = "Отчет по кассе";

            var subHeader = "";

            var fileName = "BalanceReport";

            MemoryStream output = null;
            if (balanceReport.Count > 0)
            {
                DownloadFile(type, output, fileName, balanceReport, reportName, subHeader, SkipFieldsList);
            }
            else
            {
                Response.Write(EXPORT_ERROR_MESSAGE);
            }
        }

        private string GetJSON(string url, string token)
        {
            /*
             * Fix from StackOverFlow http://stackoverflow.com/a/1386568
             */
            ServicePointManager.ServerCertificateValidationCallback =
                delegate(object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors)
                {
                    return true;
                };

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Headers.Add("Authorization", token);
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();

            string json = null;

            using (StreamReader reader = new StreamReader(response.GetResponseStream(), Encoding.UTF8))
            {
                json = reader.ReadToEnd();
            }
            return json;
        }

        private void DownloadFile<T>(string type, MemoryStream output, string fileName, IEnumerable<T> data, string reportName, string subHeader, List<string> SkipFieldsList = null)
        {
            var contentType = "";
            switch (type)
            {
                case "PDF":
                    ExportToPDF exportToPDF = new ExportToPDF();
                    output = exportToPDF.CreatePDF(reportName, subHeader, true, data, SkipFieldsList);
                    fileName = fileName + ".pdf";
                    contentType = "application/pdf";
                    break;
                case "Excel":
                    ExportToExcel exportToExcel = new ExportToExcel();
                    fileName = fileName + ".xlsx";
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    output = exportToExcel.CreateExcel(fileName, reportName, subHeader, data,
                        SkipFieldsList);
                    break;
            }
            Response.AddHeader("Content-Type", contentType);
            Response.AddHeader("Content-Disposition", "attachment;filename=" + fileName);
            Response.OutputStream.Write(output.ToArray(), 0, (int)output.Length);
            Response.End();
        }
	}
}