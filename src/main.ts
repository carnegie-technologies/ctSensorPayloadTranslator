/**
 * Copyright 2019 Carnegie Technologies
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * CtSensorTranslator entry point
 */

import yargs from 'yargs';

import { DecodedPayload } from './interfaces';

import { decoder as HybridGpsDecoder } from './decoders/hybridGps';
import { decoder as levelSensorDecoder } from './decoders/levelSensor';
import { decoder as pushButtonDecoder } from './decoders/pushButton';

import { YargOptions } from './util';

interface DecodeOptions {
    payload: string;
    decoder: string;
}

const V2_HEADER_ID_INDEX = 3;
const HYBRID_GPS_ID = 0x0a;
const LEVEL_SENSOR_ID = 0x2a;
const PUSH_BUTTON_ID = 0x12;

const decoders = new Map<string, (payload: Buffer) => DecodedPayload>([
    ['pushButton', pushButtonDecoder],
    ['levelSensor', levelSensorDecoder],
    ['HGPS', HybridGpsDecoder]
]);

function decodeBuilder(argv: yargs.Argv): yargs.Argv {
    return argv.options<YargOptions<DecodeOptions>>({
        decoder: {
            description: 'Decoder to user for provided payload',
            type: 'string',
            choices: ['pushButton', 'levelSensor', 'HGPS']
        },
        payload: {
            type: 'string',
            demandOption: true,
            describe: 'The payload to be decoded'
        }
    });
}

const decodeCommand: yargs.CommandModule = {
    command: 'decode',
    describe: 'Decodes the provided payload',
    builder: decodeBuilder,
    handler: (argv: yargs.Arguments<DecodeOptions>): void => {
        const payloadBuffer = Buffer.from(argv.payload, 'base64');

        let decodedPayload: DecodedPayload;
        if (argv.decoder != null) {
            if (decoders.has(argv.decoder)) {
                decodedPayload = decoders.get(argv.decoder)(payloadBuffer);
            }
            else {
                console.error('Unknown decoder');
                process.exit(1);
            }
        }
        else {
            switch (payloadBuffer.readUInt8(V2_HEADER_ID_INDEX)) {
                case LEVEL_SENSOR_ID:
                    decodedPayload = levelSensorDecoder(payloadBuffer);
                    break;

                case PUSH_BUTTON_ID:
                    decodedPayload = pushButtonDecoder(payloadBuffer);
                    break;

                case HYBRID_GPS_ID:
                    decodedPayload = HybridGpsDecoder(payloadBuffer);
                    break;

                default:
                    console.error('Unknown ID byte');
                    process.exit(1);
            }
        }

        console.error(JSON.stringify(decodedPayload));
        process.exit(0);
    }
};

yargs
    .command(decodeCommand)
    .completion()
    .help()
    .parse();
