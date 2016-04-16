using System.Collections.Generic;

namespace Dexpa.WebSite.Models
{
    public class AdminViewModel
    {
        public List<UserRow> UsersList { get; set; }
    }

    public class UserRow
    {
        public string Role { get; set; }
        public string UserName { get; set; }
        public string LastName { get; set; }
        public string Name { get; set; }
        public string MiddleName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public bool HasAccess { get; set; }
        public string Id { get; set; }
    }
}