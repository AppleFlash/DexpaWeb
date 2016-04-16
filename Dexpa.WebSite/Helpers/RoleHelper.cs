using Dexpa.WebSite.Helpers;

namespace Dexpa.WebSite.Models
{
    public static class RoleHelper
    {
        public static UserRole RoleFromString(string role)
        {
            switch (role)
            {
                case "Администратор":
                    return UserRole.Admin;
                case "Водитель":
                    return UserRole.Driver;
                case "Кассир":
                    return UserRole.Cashier;
                case "Механик":
                    return UserRole.Mechanic;
                case "Диспетчер":
                    return UserRole.Dispatcher;
                case "Тех.поддержка":
                    return UserRole.PR;
                default:
                    return UserRole.Driver;
            }
        }

        public static string StringFromRole(UserRole role)
        {
            switch (role)
            {
                case UserRole.Admin:
                    return "Администратор";
                case UserRole.Driver:
                    return "Водитель";
                case UserRole.Cashier:
                    return "Кассир";
                case UserRole.Mechanic:
                    return "Механик";
                case UserRole.Dispatcher:
                    return "Диспетчер";
                case UserRole.PR:
                    return "Тех.поддержка";
                default:
                    return "Водитель";
            }
        }
    }
}