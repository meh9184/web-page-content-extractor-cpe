class PaintFlash {

    constructor(){

        this.t = null;
        this.a = null;
        this.b = null;

        this._menu = [];

    }

    menu_extract(callback) {

        let self = this;

        $('a').bind("click.myDisable", function() {
            return false;
        });

        $('*').mouseenter(function (e) {
            e.preventDefault();

            self.t = $(this).css("border");
            self.a = this;

            $(this).css("border","red solid 1px");
            // $(this).css("color","red");
            // $(this).css("background-color","red");

        });

        $('*').mouseout(function (e) {
            e.preventDefault();

            $(this).css("border",self.t);

        });


        $(window).mousedown(function (e) {
            e.preventDefault();


            if( e.button === 0 ) {

                $(self.a).css("border","blue solid 1px");
                $(self.a).attr('dom_check_attr',"checked");
                self.t = null;

                self._menu.push(self.a);

                callback.call(self.a);

                self.deactivate();

            }
            else if(e.button === 2 ) {

                // e.deactivate();

                // console.log(super);

                self.deactivate();

            }
        });
    }

    one_extract(callback) {

        let self = this;

        $('*').mouseenter(function (e) {
            e.preventDefault();

            self.t = $(this).css("border");
            self.a = $(this);
            $(this).css("border","red solid 1px");

        });

        $('*').mouseout(function (e) {
            e.preventDefault();

            $(this).css("border",self.t);

        });

        $(window).mousedown(function (e) {
            e.preventDefault();
            if( e.button === 0 ) {

                self.t = null;
                callback.call(self.a);
                self.deactivate();

            }
            else if(e.button === 2 ) {


                self.deactivate();

            }
        });
    }

    restore(i) {

        $(this._menu[i]).css("border","");
        $(this._menu[i]).removeAttr("dom_check_attr");
        this._menu.splice(i, 1);

    }

    deactivate() {
        $('a').unbind("click.myDisable");
        $('*').off("mouseenter");
        $('*').off("mouseout");
        $(window).unbind("mousedown");
    }


    get menu() {
        return this._menu;
    }
}