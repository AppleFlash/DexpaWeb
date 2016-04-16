using Microsoft.AspNet.Identity.EntityFramework;

namespace Dexpa.WebSite.Models
{
    // You can add profile data for the user by adding more properties to your User class, please visit http://go.microsoft.com/fwlink/?LinkID=317594 to learn more.
    public class User : IdentityUser
    {
        public string LastName { get; set; }

        public string Name { get; set; }

        public string MiddleName { get; set; }

        public string PhoneNumber { get; set; }

        public string Email { get; set; }

        public bool HasAccess { get; set; }

        public UserToken Token { get; set; }

        public string IpUserName { get; set; }

        public string IpPassword { get; set; }

        public string IpProvider { get; set; }

        public User()
        {
            Token = new UserToken();
        }
    }

    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext()
            : base("DefaultConnection")
        {
        }
    }
}