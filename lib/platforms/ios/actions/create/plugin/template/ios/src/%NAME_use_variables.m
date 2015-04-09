
- (void)getCordovaInstallVariables:(CDVInvokedUrlCommand*)command
{
    NSDictionary* installVariables = [[NSBundle mainBundle] objectForInfoDictionaryKey: @"CDVInstallVariables"];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: installVariables];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}
