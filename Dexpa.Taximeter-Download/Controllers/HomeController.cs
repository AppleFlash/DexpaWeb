using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Dexpa.Taximeter_Download.Controllers
{
    public class HomeController : Controller
    {
        public FileContentResult Index()
        {
            var path = ConfigurationManager.AppSettings["TaximeterPath"];
            var files = new DirectoryInfo(path);
            var lastFile = files.GetFileSystemInfos()
                .OrderByDescending(f => f.LastWriteTime)
                .FirstOrDefault();

            if (lastFile != null)
            {
                byte[] fileBytes = System.IO.File.ReadAllBytes(lastFile.FullName);
                return File(fileBytes, "application/octet-stream", lastFile.Name);
            }

            return null;
        }
    }
}