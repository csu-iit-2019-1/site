using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TraWell.Models;
using TraWell.Services;

namespace TraWell.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public JsonResult CitiesList()
        {
            var s = Requester.SendGET("http://localhost:4044/api/city/");
            s = s.Replace("\\", "");
            s = s.Substring(1, s.Length - 2);
            return Json(s, JsonRequestBehavior.AllowGet);
        }

        public JsonResult CityInfo(int id)
        {
            var s = Requester.SendGET("http://localhost:4044/api/city/"+id);
            s = s.Replace("\\", "");
            s = s.Substring(1, s.Length - 2);
            return Json(s, JsonRequestBehavior.AllowGet);
        }

        public JsonResult CityEvents()
        {
            Stream req = Request.InputStream;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string json = new StreamReader(req).ReadToEnd();
            var s = Requester.SendPOST("http://localhost:4044/api/events/", json);
            s = s.Replace("\\", "");
            s = s.Substring(1, s.Length - 2);
            return Json(s, JsonRequestBehavior.AllowGet);
        }

        public JsonResult Routing()
        {
            Stream req = Request.InputStream;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string json = new StreamReader(req).ReadToEnd();
            var s = Requester.SendPOST("http://localhost:4044/api/routes/", json);
            s = s.Replace("\\", "");
            s = s.Substring(1, s.Length - 2);
            return Json(s, JsonRequestBehavior.AllowGet);
        }

        
    }
}