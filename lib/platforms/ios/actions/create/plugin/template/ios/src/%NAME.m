#import <Cordova/CDV.h>
#import "%NAME.h"

@implementation %NAME

- (void)toUpper:(CDVInvokedUrlCommand*)command
{
    NSString* upper = [[command.arguments objectAtIndex:0] uppercaseString];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:upper];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}
%NAME_USE_VARIABLES
@end
