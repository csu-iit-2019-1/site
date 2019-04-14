using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(TraWell.Startup))]
namespace TraWell
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
