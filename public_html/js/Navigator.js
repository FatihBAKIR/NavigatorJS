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
    var TemplateSource = null, Scripts = null, Data = null;

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

    var dir = file.substring(0, file.lastIndexOf("/") + 1);

    for (var i = 0; i < this.ScriptFiles.length; i++)
        this.ScriptFiles[i] = this.ScriptFiles[i].replace("@", dir);

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
        if (this.ActiveView !== null)
            Events.BroadCastMessage(this.ActiveView.Name + ".Unload", null);
        if (typeof args === "undefined")
            args = null;
        if (this.Views[page] === null)
        {
            console.error("Page " + page + " is not defined");
            return;
        }
        this.ActiveView = this.Views[page];
        $("#main").html(this.ActiveView.MainView);
        var DoneScripts = 0;
        var ScriptCount = this.ActiveView.ScriptFiles.length;
        for (var i = 0; i < ScriptCount; i++)
            $.getScript(this.ActiveView.ScriptFiles[i], function() {
                DoneScripts++;
                if (DoneScripts === ScriptCount)
                    Events.BroadCastMessage(Navigator.ActiveView.Name + ".Load", args);
            });
        window.Args = args;
        window.Templates = this.ActiveView.Templates;
    },
    ActiveView: null
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