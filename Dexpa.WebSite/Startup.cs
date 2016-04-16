using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Dexpa.WebSite.Startup))]
namespace Dexpa.WebSite
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
