using System.Configuration;
using System.Web.Optimization;

namespace Dexpa.WebSite
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            try
            {
                BundleTable.EnableOptimizations = bool.Parse(ConfigurationManager.AppSettings["EnableBundling"]);
            }
            catch
            {
                BundleTable.EnableOptimizations = false;
            }

            bundles.Add(new ScriptBundle("~/bundles/mapTools").Include(
                "~/Scripts/AdditionalScripts/YandexMapScript.js",
                "~/Scripts/MapScripts/MapCore.js",
                "~/Scripts/MapScripts/selectBalloonContent.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/scripts").Include(
                "~/Scripts/jquery-2.1.0.min.js",
                "~/Scripts/angular.js",
                "~/Scripts/modernizr-*",
                "~/Scripts/jquery.validate*",
                "~/Scripts/jquery-ui.min.js",

                "~/Scripts/ThemeScripts/DesignHelpersScript.js",
                "~/Scripts/bootstrap.min.js",
                "~/Scripts/respond.min.js",

                "~/Scripts/AngularControllers/AppInit.js",
                "~/Scripts/AngularDirectives/DateTimeDirectives.js",
                "~/Scripts/AngularDirectives/TableDataFormatDirectives.js",

                "~/Scripts/ToolsScripts/ClientValidationScript.js",
                "~/Scripts/ToolsScripts/SortingScript.js",
                "~/Scripts/ToolsScripts/ShowModalScript.js",
                "~/Scripts/ToolsScripts/moment.js",
                "~/Scripts/ToolsScripts/jquery.datetimepicker.js",
                "~/Scripts/ToolsScripts/ShowNotificationScript.js",
                "~/Scripts/ToolsScripts/dropdownPanelScript.js",
                "~/Scripts/ToolsScripts/lightbox.min.js",
                "~/Scripts/ToolsScripts/OrderCostHelper.js",

                "~/Scripts/ThemeScripts/jquery.gritter.min.js",

                "~/Scripts/AdditionalScripts/GetToken.js",

                "~/Scripts/SIPml-api.js",
                "~/Scripts/SIPml-api.js?svn=224",
                "~/Scripts/ToolsScripts/SIPmlCore.js",
                "~/Scripts/ToolsScripts/ipphoneScript.js"

                ));

            bundles.Add(new StyleBundle("~/Content/Styles/css").Include(
                "~/Content/Theme/bootstrap.min.css",
                "~/Content/Theme/bootstrap-override.css",
                "~/Content/Styles/lightbox.css",
                "~/Content/Theme/style.default.css",
                "~/Content/Styles/dropdownPanelStyle.css",
                "~/Content/Theme/font-awesome.min.css",
                "~/Content/Theme/jquery-ui-1.10.3.min.css",
                "~/Content/Styles/LayoutStyles.css",
                "~/Content/Theme/jquery.datetimepicker.css",
                "~/Content/Styles/Dispatcher/aditionalStyles.css",
                "~/Content/Styles/Dispatcher/newOrderStyle.css",
                "~/Content/Styles/Drivers/additionalStyles.css",
                "~/Content/Styles/CashDesk/additionalStyles.css",
                "~/Content/Styles/Transactions/additionalStyles.css",
                "~/Content/Theme/jquery.gritter.css",
                "~/Content/Styles/adminDropDownMenu.css",
                "~/Content/Styles/Dispatcher/SearchResults.css",
                "~/Content/Styles/ipphoneStyle.css"
                ));
        }
    }
}
