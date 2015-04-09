%NAME_USE_VARIABLES_1using WPCordovaClassLib.Cordova.JSON;

namespace WPCordovaClassLib.Cordova.Commands
{
    public class %NAME : BaseCommand
    {
        public void toUpper(string args)
        {
            string upper = JsonHelper.Deserialize<string[]>(args)[0].ToUpper();
            DispatchCommandResult(new PluginResult(PluginResult.Status.OK, upper));
        }%NAME_USE_VARIABLES_2
    }
}
