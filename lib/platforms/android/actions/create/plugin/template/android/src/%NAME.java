package %ID;
%NAME_USE_VARIABLES_1
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;%NAME_USE_VARIABLES_2

public final class %NAME extends CordovaPlugin {
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("toUpper")) {
            toUpper(args, callbackContext);
        } %NAME_USE_VARIABLES_3else {
            return false;
        }
        return true;
    }

    private void toUpper(JSONArray args, CallbackContext callbackContext) throws JSONException {
        callbackContext.success(args.getString(0).toUpperCase());
    }%NAME_USE_VARIABLES_4
}
