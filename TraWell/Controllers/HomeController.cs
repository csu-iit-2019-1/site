using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using TraWell.Models;
using TraWell.Services;

namespace TraWell.Controllers
{
    public class HomeController : Controller
    {
        private const string CITY_SERVICE_URL = "https://apicities20190502035621.azurewebsites.net/api/cities/";
        private const string EVENTS_SERVICE_URL = "https://iitevents.herokuapp.com/events/";
        private const string ROUTES_SERVICE_URL = "http://localhost:4044/api/routes/";

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
            var response = cutResponse(Requester.SendGET(CITY_SERVICE_URL + "getless"));
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public JsonResult CityInfo(int id)
        {
            var response = Requester.SendGET(CITY_SERVICE_URL + id);
            response = response.Replace("\"", "");
            response = response.Replace("'", "\"");         
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public JsonResult CityEvents()
        {
            Stream req = Request.InputStream;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string json = new StreamReader(req).ReadToEnd();
            var response = Requester.SendPOST(EVENTS_SERVICE_URL + "getEvents", json);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public JsonResult Routing()
        {
            Stream req = Request.InputStream;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string json = new StreamReader(req).ReadToEnd();
            var response = cutResponse(Requester.SendPOST(ROUTES_SERVICE_URL, json));
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public JsonResult Weather()
        {
            Stream req = Request.InputStream;
            req.Seek(0, SeekOrigin.Begin);
            string json = new StreamReader(req).ReadToEnd();
            var response = cutResponse(Requester.SendPOST(CITY_SERVICE_URL, json));
            return Json(response, JsonRequestBehavior.AllowGet);

        }

        private string cutResponse(string response)
        {
            response = response.Replace("\\", "");
            response = response.Substring(1, response.Length - 2);
            return response;
        }

        //private string Convert(string response)
        //{
        //    var r2 = Encoding.UTF8.GetString( response, 0, raw_response.Length);
        //    if (r2[0] == '\uFEFF')
        //    {
        //        r2 = r2.Substring(1);
        //    }
        //}
    }
}