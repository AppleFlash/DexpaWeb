using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web;
using System.Web.Caching;
using System.Web.Mvc;
using Dexpa.WebSite.Models.RolesAndAccess;
using Microsoft.AspNet.Identity;

namespace Dexpa.WebSite.Models
{
    public class RoleAccessModel
    {
        public bool HasAccess { get; private set; }
        public bool CanEditOrders { get; private set; }
        public bool CanEditDrivers { get; private set; }
        public bool CanEditCash { get; private set; }
        public bool CanEditCars { get; private set; }
        public bool CanEditWayBills { get; set; }
        public bool CanEditSettings { get; private set; }

        public bool CanSeeOrders { get; private set; }
        public bool CanSeeDrivers { get; private set; }
        public bool CanSeeCash { get; private set; }
        public bool CanSeeCars { get; private set; }
        public bool CanSeeClients { get; private set; }
        public bool CanSeeWayBills { get; private set; }

        public bool CanSeeAccounts { get; private set; }
        public bool CanEditAccounts { get; private set; }

        public bool CanSeeAndEditCarEvents { get; private set; }

        public AdminSeeAccessEnums CanSeeAdminFunctions { get; private set; }
        public AdminEditAccessEnums CanEditAdminFunctions { get; private set; }

        public ReportsAccess CanSeeReports { get; private set; }

        public RoleAccessModel()
        {
            HasAccess = false;
        }

        public RoleAccessModel(IPrincipal user, bool hasAccess)
        {
            HasAccess = hasAccess;

            if (!hasAccess)
            {
                return;
            }

            CanEditCars = false;
            CanEditCash = false;
            CanEditDrivers = false;
            CanEditOrders = false;
            CanEditWayBills = false;
            CanEditSettings = false;
            CanEditAccounts = false;

            CanSeeCars = false;
            CanSeeCash = false;
            CanSeeDrivers = false;
            CanSeeOrders = false;
            CanSeeClients = false;
            CanSeeWayBills = false;
            CanSeeAccounts = false;

            CanSeeAndEditCarEvents = false;

            CanSeeAdminFunctions = new AdminSeeAccessEnums();
            CanEditAdminFunctions = new AdminEditAccessEnums();

            CanSeeReports = new ReportsAccess();

            if (user.IsInRole("Администратор"))
            {
                CanEditCars = true;
                CanEditCash = true;
                CanEditDrivers = true;
                CanEditOrders = true;
                CanEditWayBills = true;
                CanEditSettings = true;
                CanEditAccounts = true;

                CanSeeCars = true;
                CanSeeCash = true;
                CanSeeDrivers = true;
                CanSeeOrders = true;
                CanSeeClients = true;
                CanSeeWayBills = true;
                CanSeeAccounts = true;

                CanSeeAndEditCarEvents = true;

                CanSeeAdminFunctions = AdminSeeAccessEnums.RobotHistory | AdminSeeAccessEnums.Tariffs |
                                       AdminSeeAccessEnums.TrackPoints | AdminSeeAccessEnums.WorkConditions |
                                       AdminSeeAccessEnums.Reports;

                CanEditAdminFunctions = AdminEditAccessEnums.Tariffs | AdminEditAccessEnums.WorkConditions |
                                        AdminEditAccessEnums.Settings;

                CanSeeReports = ReportsAccess.AllOrders | ReportsAccess.Dispatchers | ReportsAccess.Drivers |
                                ReportsAccess.DriversWorkTime | ReportsAccess.Orders | ReportsAccess.Organizations |
                                ReportsAccess.YandexOrders;

                return;
            }

            if (user.IsInRole("Диспетчер"))
            {
                CanEditOrders = true;

                CanSeeCars = true;
                CanSeeDrivers = true;
                CanSeeOrders = true;
                CanSeeClients = true;
                CanSeeWayBills = true;

                CanSeeAdminFunctions = AdminSeeAccessEnums.Reports | AdminSeeAccessEnums.Tariffs;

                CanSeeReports = ReportsAccess.AllOrders | ReportsAccess.YandexOrders;

                return;
            }

            if (user.IsInRole("Тех.поддержка"))
            {
                CanEditCars = true;
                CanEditCash = true;
                CanEditDrivers = true;
                CanEditOrders = true;
                CanEditWayBills = true;
                CanEditSettings = true;

                CanSeeCars = true;
                CanSeeCash = true;
                CanSeeDrivers = true;
                CanSeeOrders = true;
                CanSeeClients = true;
                CanSeeWayBills = true;
                CanSeeAccounts = true;

                CanSeeAdminFunctions = AdminSeeAccessEnums.RobotHistory | AdminSeeAccessEnums.Tariffs |
                                       AdminSeeAccessEnums.TrackPoints | AdminSeeAccessEnums.WorkConditions |
                                       AdminSeeAccessEnums.Reports;

                CanEditAdminFunctions = AdminEditAccessEnums.Tariffs |
                                        AdminEditAccessEnums.WorkConditions;

                CanSeeReports = ReportsAccess.AllOrders | ReportsAccess.Dispatchers | ReportsAccess.Drivers |
                                ReportsAccess.DriversWorkTime | ReportsAccess.Orders | ReportsAccess.Organizations |
                                ReportsAccess.YandexOrders;

                return;
            }

            if (user.IsInRole("Кассир"))
            {
                CanEditCash = true;
                CanEditWayBills = true;

                CanSeeCars = true;
                CanSeeCash = true;
                CanSeeDrivers = true;
                CanSeeWayBills = true;

                CanSeeAdminFunctions = AdminSeeAccessEnums.Reports;

                CanSeeReports = ReportsAccess.AllOrders | ReportsAccess.Dispatchers | ReportsAccess.Drivers |
                                ReportsAccess.DriversWorkTime | ReportsAccess.Orders | ReportsAccess.Organizations |
                                ReportsAccess.YandexOrders;

                return;
            }

            if (user.IsInRole("Водитель"))
            {
                return;  
            }

            if (user.IsInRole("Механик"))
            {
                CanEditWayBills = true;

                CanSeeDrivers = true;
                CanSeeCars = true;
                CanSeeWayBills = true;

                CanSeeAndEditCarEvents = true;

                CanSeeAdminFunctions = AdminSeeAccessEnums.TrackPoints | AdminSeeAccessEnums.Reports;

                CanSeeReports = ReportsAccess.DriversWorkTime;
            }
        }
    }
}