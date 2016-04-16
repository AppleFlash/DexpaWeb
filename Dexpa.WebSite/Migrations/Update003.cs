namespace Dexpa.WebSite.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Update003 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AspNetUsers", "IpUserName", c => c.String());
            AddColumn("dbo.AspNetUsers", "IpPassword", c => c.String());
            AddColumn("dbo.AspNetUsers", "IpProvider", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.AspNetUsers", "IpProvider");
            DropColumn("dbo.AspNetUsers", "IpPassword");
            DropColumn("dbo.AspNetUsers", "IpUserName");
        }
    }
}
