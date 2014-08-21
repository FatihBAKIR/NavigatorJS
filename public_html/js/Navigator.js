function View(file)
{
    var filename = file.replace(/^.*[\\\/]/, '')
    this.Name = filename;
    var src = "";

    $.ajax({
        async: false,
        url: file + ".html"
    }).done(function(data) {
        src = data;
    });

    var Source = src;

    var parts = Source.split("<!#>");
    var pattern = new RegExp("<#.*?>", "i");
    var parser = new RegExp("<#|>", "ig");
    var TemplateSource = null, Scripts = null, Data = null, Styles = null;

    for (var i = 0; i < parts.length; i++) {
        if (parts[i].match(pattern) === null)
            continue;
        var def = parts[i].match(pattern)[0];
        var part = def.replace(parser, "");
        part = part.toLowerCase();

        switch (part)
        {
            case "main":
                this.MainView = parts[i].replace(def, "").trim();
                break;
            case "templates":
                TemplateSource = parts[i].replace(def, "").trim();
                break;
            case "scripts":
                Scripts = parts[i].replace(def, "").trim();
                break;
            case "data":
                Data = parts[i].replace(def, "").trim();
                break;
            case "styles":
                Styles = parts[i].replace(def, "").trim();
                break;
        }
    }

    if (Data !== null)
    {
        this.Data = JSON.parse(Data);
        if (this.Data.name !== null)
            this.Name = this.Data.name;
    }

    if (parts.length == 1)
        this.MainView = parts[0].trim();

    if (Scripts !== null)
        this.ScriptFiles = Scripts.split("\n");

    if (Styles !== null)
        this.StyleSheets = Styles.split("\n");

    var dir = file.substring(0, file.lastIndexOf("/") + 1);

    if (this.ScriptFiles != null)
        for (var i = 0; i < this.ScriptFiles.length; i++)
            this.ScriptFiles[i] = this.ScriptFiles[i].replace("@", dir);

    if (this.StyleSheets != null)
        for (var i = 0; i < this.StyleSheets.length; i++)
            this.StyleSheets[i] = this.StyleSheets[i].replace("@", dir);

    var temps = {};

    if (TemplateSource !== null)
    {
        var templates = $.parseHTML(TemplateSource);
        $.each(templates, function(i, el) {
            temps[el.id] = Handlebars.compile(el.innerHTML);
        });
        this.Templates = temps;
    }
}

window.Navigator = {
    ChangeURL: false,
    LoadingView: null,
    RootDirectory: "Navigation",
    LoadViews: function(Root, Files)
    {
        this.RootDirectory = Root;
        for (i = 0; i < Files.length; i++)
            this.LoadView(Files[i]);
    },
    LoadView: function(file)
    {
        var view = new View(this.RootDirectory + "/" + file);
        this.Views[view.Name] = view;
    },
    Views: {},
    Navigate: function(page, args)
    {
        if (page != this.LoadingView && this.LoadingView != null)
            this.Navigate(this.LoadingView);

        if (this.ActiveView !== null)
            Events.BroadCastMessage(this.ActiveView.Name + ".Unload", null);

        if (typeof args === "undefined")
            args = null;

        if (this.Views[page] === null)
        {
            console.error("Page " + page + " is not defined");
            return;
        }

        if (this.ChangeURL && page != this.LoadingView)
            window.history.pushState({"page": page, "args": args}, "", "/Navigator/#" + page);

        this.ActiveView = this.Views[page];
        this.UnloadStyle();
        if (this.ActiveView.StyleSheets != null)
        {
            var SheetCount = this.ActiveView.StyleSheets.length;
            for (var i = 0; i < SheetCount; i++)
                this.LoadStyle(this.ActiveView.StyleSheets[i]);
        }

        window.Args = args;
        window.Templates = this.ActiveView.Templates;
        window.ViewData = this.ActiveView.Data;
        
        if (this.ActiveView.ScriptFiles != null)
            this.LoadScripts();
        else
            $("#main").html(this.ActiveView.MainView);
    },
    ActiveView: null,
    LoadStyle: function(file)
    {
        if (document.createStyleSheet)
            document.createStyleSheet(file);
        else
            $('<link rel="stylesheet" type="text/css" href="' + file + '" dynamic="1" />').appendTo('head');
    },
    UnloadStyle: function()
    {
        $("link").each(function()
        {
            if ($(this).attr("dynamic") == "1")
                $(this).remove();
        });
    },
    LoadedScripts: [],
    LoadScripts: function()
    {
        window.DoneScripts = 0;
        window.ScriptCount = this.ActiveView.ScriptFiles.length;
        for (var i = 0; i < ScriptCount; i++)
            this.LoadScript(this.ActiveView.ScriptFiles[i]);
    },
    LoadScript: function(file)
    {
        if (this.LoadedScripts.indexOf(file) === -1)
            $.getScript(file, function() {
                Navigator.LoadedScripts.push(file);
                Navigator.CheckLoading();
            });
        else
            this.CheckLoading();
    },
    CheckLoading: function()
    {
        DoneScripts++;
        if (DoneScripts === ScriptCount)
        {
            $("#main").html(Navigator.ActiveView.MainView);
            Events.BroadCastMessage(Navigator.ActiveView.Name + ".Load", window.Args);
        }
    }
};

function Event(name, handle)
{
    this.Name = name;
    this.Handle = handle;
}

window.Events = {
    Pairs: [],
    AddListener: function(name, handle)
    {
        this.Pairs.push(new Event(name, handle));
    },
    RemoveListener: function(name, handle)
    {
        for (var i = this.Pairs.length - 1; i >= 0; i--) {
            if (this.Pairs[i].Name === name && this.Pairs[i].Handle === handle)
            {
                this.Pairs.splice(i, 1);
            }
        }
    },
    BroadCastMessage: function(name, data)
    {
        for (var i = this.Pairs.length - 1; i >= 0; i--) {
            if (this.Pairs[i].Name === name)
            {
                this.Pairs[i].Handle(data);
            }
        }
    }
};

window.onpopstate = function(e) {
    if (e.state) {
        Navigator.Navigate(e.state.page, e.state.args);
    }
};