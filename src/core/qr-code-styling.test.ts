import { suite, test } from "@testdeck/mocha";
import { expect } from "chai";
import { QRCodeStyling } from "./qr-code-styling.js";

@suite("Test QRCodeStyling class")
export class IndexTest {
  @test("The README example should work correctly")
  async readmeExample() {
    const qrCode = new QRCodeStyling({
      data: "TEST",
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mNk+M+AARiHsiAAcCIKAYwFoQ8AAAAASUVORK5CYII=",
      dotsOptions: {
        color: "#4267b2",
        type: "rounded"
      },
      backgroundOptions: {
        color: "#e9ebee"
      }
    });
    global.document.body.innerHTML = "<div id='container'></div>";

    const container = global.document.getElementById("container")!;

    qrCode.append(container);

    const encoded = await qrCode.serialize();

    expect(encoded).to.equal(
      '<?xml version="1.0" standalone="no"?>\r\n<svg xmlns="http://www.w3.org/2000/svg" width="210" height="210" viewBox="0 0 210 210"><defs><mask id="mask-background-color" maskUnits="userSpaceOnUse" x="0" y="0" width="210" height="210"><g fill="#fff"><rect x="0" y="0" width="210" height="210" rx="0"/></g></mask><mask id="mask-dot-color" maskUnits="userSpaceOnUse" x="0" y="0" width="210" height="210"><g fill="#fff"><path d="M 0 90 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(180,5,95)"/><path d="M 10 80 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(-90,15,85)"/><rect x="10" y="90" width="10" height="10" transform="rotate(0,15,95)"/><rect x="10" y="100" width="10" height="10" transform="rotate(0,15,105)"/><path d="M 10 110 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(180,15,115)"/><rect x="20" y="80" width="10" height="10" transform="rotate(0,25,85)"/><path d="M 20 90 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,25,95)"/><rect x="20" y="110" width="10" height="10" transform="rotate(0,25,115)"/><rect x="30" y="80" width="10" height="10" transform="rotate(0,35,85)"/><path d="M 30 110 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,35,115)"/><path d="M 30 120 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(90,35,125)"/><rect x="40" y="80" width="10" height="10" transform="rotate(0,45,85)"/><rect x="40" y="90" width="10" height="10" transform="rotate(0,45,95)"/><path d="M 40 100 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(180,45,105)"/><rect x="50" y="80" width="10" height="10" transform="rotate(0,55,85)"/><rect x="50" y="90" width="10" height="10" transform="rotate(0,55,95)"/><rect x="50" y="100" width="10" height="10" transform="rotate(0,55,105)"/><rect x="60" y="80" width="10" height="10" transform="rotate(0,65,85)"/><rect x="60" y="100" width="10" height="10" transform="rotate(0,65,105)"/><path d="M 60 120 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(180,65,125)"/><path d="M 70 80 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,75,85)"/><rect x="70" y="90" width="10" height="10" transform="rotate(0,75,95)"/><path d="M 70 100 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,75,105)"/><path d="M 70 120 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(0,75,125)"/><path d="M 80 0 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(180,85,5)"/><path d="M 80 40 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(-90,85,45)"/><rect x="80" y="50" width="10" height="10" transform="rotate(0,85,55)"/><path d="M 80 60 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(90,85,65)"/><circle cx="85" cy="115" r="5" transform="rotate(0,85,115)"/><path d="M 80 130 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(-90,85,135)"/><rect x="80" y="140" width="10" height="10" transform="rotate(0,85,145)"/><rect x="80" y="150" width="10" height="10" transform="rotate(0,85,155)"/><rect x="80" y="160" width="10" height="10" transform="rotate(0,85,165)"/><rect x="80" y="170" width="10" height="10" transform="rotate(0,85,175)"/><rect x="80" y="180" width="10" height="10" transform="rotate(0,85,185)"/><path d="M 80 190 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(180,85,195)"/><path d="M 90 0 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(0,95,5)"/><path d="M 90 20 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(-90,95,25)"/><path d="M 90 30 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(180,95,35)"/><rect x="90" y="50" width="10" height="10" transform="rotate(0,95,55)"/><circle cx="95" cy="85" r="5" transform="rotate(0,95,85)"/><path d="M 90 130 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,95,135)"/><rect x="90" y="140" width="10" height="10" transform="rotate(0,95,145)"/><rect x="90" y="150" width="10" height="10" transform="rotate(0,95,155)"/><rect x="90" y="160" width="10" height="10" transform="rotate(0,95,165)"/><rect x="90" y="180" width="10" height="10" transform="rotate(0,95,185)"/><path d="M 90 190 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,95,195)"/><circle cx="105" cy="15" r="5" transform="rotate(0,105,15)"/><path d="M 100 30 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(0,105,35)"/><rect x="100" y="50" width="10" height="10" transform="rotate(0,105,55)"/><path d="M 100 60 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(90,105,65)"/><path d="M 100 160 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,105,165)"/><rect x="100" y="170" width="10" height="10" transform="rotate(0,105,175)"/><path d="M 100 180 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,105,185)"/><circle cx="105" cy="205" r="5" transform="rotate(0,105,205)"/><circle cx="115" cy="5" r="5" transform="rotate(0,115,5)"/><circle cx="115" cy="25" r="5" transform="rotate(0,115,25)"/><rect x="110" y="50" width="10" height="10" transform="rotate(0,115,55)"/><path d="M 110 70 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(-90,115,75)"/><path d="M 110 80 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(180,115,85)"/><path d="M 110 120 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(-90,115,125)"/><rect x="110" y="130" width="10" height="10" transform="rotate(0,115,135)"/><path d="M 110 140 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(90,115,145)"/><rect x="110" y="170" width="10" height="10" transform="rotate(0,115,175)"/><path d="M 110 190 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(180,115,195)"/><circle cx="125" cy="15" r="5" transform="rotate(0,125,15)"/><path d="M 120 40 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(-90,125,45)"/><rect x="120" y="50" width="10" height="10" transform="rotate(0,125,55)"/><path d="M 120 60 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(90,125,65)"/><path d="M 120 80 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(0,125,85)"/><path d="M 120 110 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(-90,125,115)"/><path d="M 120 120 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,125,125)"/><circle cx="125" cy="155" r="5" transform="rotate(0,125,155)"/><rect x="120" y="170" width="10" height="10" transform="rotate(0,125,175)"/><rect x="120" y="180" width="10" height="10" transform="rotate(0,125,185)"/><rect x="120" y="190" width="10" height="10" transform="rotate(0,125,195)"/><path d="M 120 200 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(90,125,205)"/><path d="M 130 90 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(180,135,95)"/><rect x="130" y="110" width="10" height="10" transform="rotate(0,135,115)"/><circle cx="135" cy="145" r="5" transform="rotate(0,135,145)"/><path d="M 130 160 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(-90,135,165)"/><rect x="130" y="170" width="10" height="10" transform="rotate(0,135,175)"/><rect x="130" y="190" width="10" height="10" transform="rotate(0,135,195)"/><path d="M 140 90 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,145,95)"/><rect x="140" y="100" width="10" height="10" transform="rotate(0,145,105)"/><path d="M 140 110 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,145,115)"/><path d="M 140 170 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,145,175)"/><rect x="140" y="180" width="10" height="10" transform="rotate(0,145,185)"/><path d="M 140 190 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,145,195)"/><path d="M 150 80 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(180,155,85)"/><path d="M 150 100 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(0,155,105)"/><path d="M 150 120 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(-90,155,125)"/><path d="M 150 130 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(90,155,135)"/><path d="M 150 150 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(180,155,155)"/><path d="M 150 180 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(0,155,185)"/><circle cx="155" cy="205" r="5" transform="rotate(0,155,205)"/><path d="M 160 80 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(0,165,85)"/><path d="M 160 140 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(-90,165,145)"/><rect x="160" y="150" width="10" height="10" transform="rotate(0,165,155)"/><path d="M 160 160 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(90,165,165)"/><path d="M 170 120 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(180,175,125)"/><circle cx="175" cy="175" r="5" transform="rotate(0,175,175)"/><circle cx="175" cy="195" r="5" transform="rotate(0,175,195)"/><path d="M 180 110 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(-90,185,115)"/><rect x="180" y="120" width="10" height="10" transform="rotate(0,185,125)"/><path d="M 180 130 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(180,185,135)"/><path d="M 180 150 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(-90,185,155)"/><path d="M 180 160 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(90,185,165)"/><circle cx="185" cy="205" r="5" transform="rotate(0,185,205)"/><path d="M 190 90 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(-90,195,95)"/><path d="M 190 100 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(90,195,105)"/><path d="M 190 130 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,195,135)"/><path d="M 190 140 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(90,195,145)"/><path d="M 200 80 v 10 h 5 a 5 5, 0, 0, 0, 0 -10 z" transform="rotate(-90,205,85)"/><path d="M 200 90 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,205,95)"/><circle cx="205" cy="115" r="5" transform="rotate(0,205,115)"/><circle cx="205" cy="155" r="5" transform="rotate(0,205,155)"/><circle cx="205" cy="195" r="5" transform="rotate(0,205,195)"/><path d="M 0 0 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(-90,5,5)"/><rect x="0" y="10" width="10" height="10" transform="rotate(0,5,15)"/><rect x="0" y="20" width="10" height="10" transform="rotate(0,5,25)"/><rect x="0" y="30" width="10" height="10" transform="rotate(0,5,35)"/><rect x="0" y="40" width="10" height="10" transform="rotate(0,5,45)"/><rect x="0" y="50" width="10" height="10" transform="rotate(0,5,55)"/><path d="M 0 60 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(180,5,65)"/><rect x="10" y="0" width="10" height="10" transform="rotate(0,15,5)"/><rect x="10" y="60" width="10" height="10" transform="rotate(0,15,65)"/><rect x="20" y="0" width="10" height="10" transform="rotate(0,25,5)"/><rect x="20" y="60" width="10" height="10" transform="rotate(0,25,65)"/><rect x="30" y="0" width="10" height="10" transform="rotate(0,35,5)"/><rect x="30" y="60" width="10" height="10" transform="rotate(0,35,65)"/><rect x="40" y="0" width="10" height="10" transform="rotate(0,45,5)"/><rect x="40" y="60" width="10" height="10" transform="rotate(0,45,65)"/><rect x="50" y="0" width="10" height="10" transform="rotate(0,55,5)"/><rect x="50" y="60" width="10" height="10" transform="rotate(0,55,65)"/><path d="M 60 0 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,65,5)"/><rect x="60" y="10" width="10" height="10" transform="rotate(0,65,15)"/><rect x="60" y="20" width="10" height="10" transform="rotate(0,65,25)"/><rect x="60" y="30" width="10" height="10" transform="rotate(0,65,35)"/><rect x="60" y="40" width="10" height="10" transform="rotate(0,65,45)"/><rect x="60" y="50" width="10" height="10" transform="rotate(0,65,55)"/><path d="M 60 60 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,65,65)"/><path d="M 20 20 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(-90,25,25)"/><rect x="20" y="30" width="10" height="10" transform="rotate(0,25,35)"/><path d="M 20 40 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(180,25,45)"/><rect x="30" y="20" width="10" height="10" transform="rotate(0,35,25)"/><rect x="30" y="30" width="10" height="10" transform="rotate(0,35,35)"/><rect x="30" y="40" width="10" height="10" transform="rotate(0,35,45)"/><path d="M 40 20 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,45,25)"/><rect x="40" y="30" width="10" height="10" transform="rotate(0,45,35)"/><path d="M 40 40 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,45,45)"/><path d="M 140 0 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(-90,145,5)"/><rect x="140" y="10" width="10" height="10" transform="rotate(0,145,15)"/><rect x="140" y="20" width="10" height="10" transform="rotate(0,145,25)"/><rect x="140" y="30" width="10" height="10" transform="rotate(0,145,35)"/><rect x="140" y="40" width="10" height="10" transform="rotate(0,145,45)"/><rect x="140" y="50" width="10" height="10" transform="rotate(0,145,55)"/><path d="M 140 60 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(180,145,65)"/><rect x="150" y="0" width="10" height="10" transform="rotate(0,155,5)"/><rect x="150" y="60" width="10" height="10" transform="rotate(0,155,65)"/><rect x="160" y="0" width="10" height="10" transform="rotate(0,165,5)"/><rect x="160" y="60" width="10" height="10" transform="rotate(0,165,65)"/><rect x="170" y="0" width="10" height="10" transform="rotate(0,175,5)"/><rect x="170" y="60" width="10" height="10" transform="rotate(0,175,65)"/><rect x="180" y="0" width="10" height="10" transform="rotate(0,185,5)"/><rect x="180" y="60" width="10" height="10" transform="rotate(0,185,65)"/><rect x="190" y="0" width="10" height="10" transform="rotate(0,195,5)"/><rect x="190" y="60" width="10" height="10" transform="rotate(0,195,65)"/><path d="M 200 0 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,205,5)"/><rect x="200" y="10" width="10" height="10" transform="rotate(0,205,15)"/><rect x="200" y="20" width="10" height="10" transform="rotate(0,205,25)"/><rect x="200" y="30" width="10" height="10" transform="rotate(0,205,35)"/><rect x="200" y="40" width="10" height="10" transform="rotate(0,205,45)"/><rect x="200" y="50" width="10" height="10" transform="rotate(0,205,55)"/><path d="M 200 60 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,205,65)"/><path d="M 160 20 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(-90,165,25)"/><rect x="160" y="30" width="10" height="10" transform="rotate(0,165,35)"/><path d="M 160 40 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(180,165,45)"/><rect x="170" y="20" width="10" height="10" transform="rotate(0,175,25)"/><rect x="170" y="30" width="10" height="10" transform="rotate(0,175,35)"/><rect x="170" y="40" width="10" height="10" transform="rotate(0,175,45)"/><path d="M 180 20 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,185,25)"/><rect x="180" y="30" width="10" height="10" transform="rotate(0,185,35)"/><path d="M 180 40 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,185,45)"/><path d="M 0 140 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(-90,5,145)"/><rect x="0" y="150" width="10" height="10" transform="rotate(0,5,155)"/><rect x="0" y="160" width="10" height="10" transform="rotate(0,5,165)"/><rect x="0" y="170" width="10" height="10" transform="rotate(0,5,175)"/><rect x="0" y="180" width="10" height="10" transform="rotate(0,5,185)"/><rect x="0" y="190" width="10" height="10" transform="rotate(0,5,195)"/><path d="M 0 200 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(180,5,205)"/><rect x="10" y="140" width="10" height="10" transform="rotate(0,15,145)"/><rect x="10" y="200" width="10" height="10" transform="rotate(0,15,205)"/><rect x="20" y="140" width="10" height="10" transform="rotate(0,25,145)"/><rect x="20" y="200" width="10" height="10" transform="rotate(0,25,205)"/><rect x="30" y="140" width="10" height="10" transform="rotate(0,35,145)"/><rect x="30" y="200" width="10" height="10" transform="rotate(0,35,205)"/><rect x="40" y="140" width="10" height="10" transform="rotate(0,45,145)"/><rect x="40" y="200" width="10" height="10" transform="rotate(0,45,205)"/><rect x="50" y="140" width="10" height="10" transform="rotate(0,55,145)"/><rect x="50" y="200" width="10" height="10" transform="rotate(0,55,205)"/><path d="M 60 140 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,65,145)"/><rect x="60" y="150" width="10" height="10" transform="rotate(0,65,155)"/><rect x="60" y="160" width="10" height="10" transform="rotate(0,65,165)"/><rect x="60" y="170" width="10" height="10" transform="rotate(0,65,175)"/><rect x="60" y="180" width="10" height="10" transform="rotate(0,65,185)"/><rect x="60" y="190" width="10" height="10" transform="rotate(0,65,195)"/><path d="M 60 200 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,65,205)"/><path d="M 20 160 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(-90,25,165)"/><rect x="20" y="170" width="10" height="10" transform="rotate(0,25,175)"/><path d="M 20 180 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(180,25,185)"/><rect x="30" y="160" width="10" height="10" transform="rotate(0,35,165)"/><rect x="30" y="170" width="10" height="10" transform="rotate(0,35,175)"/><rect x="30" y="180" width="10" height="10" transform="rotate(0,35,185)"/><path d="M 40 160 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(0,45,165)"/><rect x="40" y="170" width="10" height="10" transform="rotate(0,45,175)"/><path d="M 40 180 v 10 h 10 v -5 a 5 5, 0, 0, 0, -5 -5 z" transform="rotate(90,45,185)"/></g></mask></defs><image xmlns:ns1="http://www.w3.org/1999/xlink" ns1:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mNk+M+AARiHsiAAcCIKAYwFoQ8AAAAASUVORK5CYII=" x="90" y="90" width="30px" height="30px"/><rect x="0" y="0" height="210" width="210" style="mask:url(#mask-background-color)" fill="#e9ebee"/><rect x="0" y="0" height="210" width="210" style="mask:url(#mask-dot-color)" fill="#4267b2"/></svg>'
    );
  }
}
