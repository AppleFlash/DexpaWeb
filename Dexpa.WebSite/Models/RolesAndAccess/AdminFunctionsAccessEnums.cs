using System;

namespace Dexpa.WebSite.Models.RolesAndAccess
{
    [Flags]
    public enum AdminSeeAccessEnums
    {
        None = 0,
        WorkConditions = 2,
        Tariffs = 4,
        TrackPoints = 8,
        RobotHistory = 16,
        Reports = 32
    }

    [Flags]
    public enum AdminEditAccessEnums
    {
        None = 0,
        WorkConditions = 2,
        Tariffs = 4,
        Settings = 8
    }

    [Flags]
    public enum ReportsAccess
    {
        None = 0,
        Drivers = 2,
        DriversWorkTime = 4,
        Orders = 8,
        Organizations = 16,
        Dispatchers = 32,
        AllOrders = 64,
        YandexOrders = 128
    }
}