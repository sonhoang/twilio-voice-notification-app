import { Injectable } from '@nestjs/common';
import { Twilio, twiml as Twiml } from 'twilio';
import { ConfigService } from '@nestjs/config';
import {
  CALL_CALLBACK_METHOD,
  CALL_STATUS_EVENTS,
  ENV_VAR,
} from '../constants';
import { IncomingPhoneNumberInstance } from 'twilio/lib/rest/api/v2010/account/incomingPhoneNumber';
import { CallStatus } from '../types/call-status';

/**
 * This service wraps a Twilio Client with custom logic specific to this app.
 */
@Injectable()
export class TwilioService {
  public client: Twilio;

  constructor(private readonly configService: ConfigService) {
    this.client = new Twilio(
      this.configService.get<string>(ENV_VAR.ACCOUNT_SID),
      this.configService.get<string>(ENV_VAR.AUTH_TOKEN),
    );
  }

  async getPhoneNumbers(): Promise<IncomingPhoneNumberInstance[]> {
    return await this.client.incomingPhoneNumbers.list({
      limit: 100,
    });
  }

  async createCall(
    statusCallback: string,
    to: string,
    from: string,
    message: string,
  ) {
    const twiml = new Twiml.VoiceResponse();
	
	var url = "https://ci-demo-voice-notification.s3.ap-southeast-1.amazonaws.com/data/ddab2dfdfda614f84db7.mp3";
	if (message.toLowerCase() == "script1"){
		url = "https://ci-demo-voice-notification.s3.ap-southeast-1.amazonaws.com/data/script1.mp3";
	}else if (message.toLowerCase() == "script1"){
		url = "https://ci-demo-voice-notification.s3.ap-southeast-1.amazonaws.com/data/script2.mp3";
	}else{
		
	}
	
	
	
	
	twiml.play(url);
	
	console.log(twiml.toString());
	
    //twiml.say(message);
	/*twiml.say({
		voice: 'Polly.Zhiyu',
		//language: 'fr-FR'
	}, 'Chapeau!');*/
	

    const { sid: callSid, status } = await this.client.calls.create({
      statusCallback,
      statusCallbackMethod: CALL_CALLBACK_METHOD,
      statusCallbackEvent: CALL_STATUS_EVENTS,
      twiml: twiml.toString(),
      to,
      from,
    });

    return { callSid, status };
  }

  async cancelCall(callSid: string) {
    return await this.client
      .calls(callSid)
      .update({ status: CallStatus.CANCELED });
  }
}
