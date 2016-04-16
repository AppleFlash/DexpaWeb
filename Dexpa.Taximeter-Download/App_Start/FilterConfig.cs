using System.Web;
using System.Web.Mvc;

namespace Dexpa.Taximeter_Download
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
