

    private void getCordovaInstallVariables(JSONArray args, CallbackContext callbackContext) throws JSONException {
        Context context = cordova.getActivity();
        int requiredVariableId = context.getResources().getIdentifier("cdv_required_variable", "string", context.getPackageName());
        int optionalVariableId = context.getResources().getIdentifier("cdv_optional_variable", "string", context.getPackageName());
        JSONObject json = new JSONObject();
        json.put("REQUIRED_VARIABLE", context.getString(requiredVariableId));
        json.put("OPTIONAL_VARIABLE", context.getString(optionalVariableId));
        callbackContext.success(json);
    }