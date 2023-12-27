/*
* v1.01-alpha: create the project.
* v1.02-alpha: finish blockchain project.
* v1.03-alpha: finish bot api(freemint/sent/getTBA/getWeapon).
*
*
*/

class commonController {
    async getVersion (ctx) {
      const version = "1.03-alpha"
      const ret = "{\"message\":\"OK\",\"result\":\"" + version + "\"}"
      ctx.body = ret
    }

    async getAuthor (ctx) {
      const author = "punkcode"
      const ret = "{\"message\":\"OK\",\"result\":\"" + author + "\"}"
      ctx.body = ret
    }
}
  
module.exports = new commonController()


