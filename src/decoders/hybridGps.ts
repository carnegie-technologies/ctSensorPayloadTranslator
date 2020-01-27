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
 * @file Decoder for HybridGps payloads
 */

import { DecodedPayload, Header } from '../interfaces';

// tslint:disable no-bitwise
// tslint:disable strict-boolean-expressions
// tslint:disable no-magic-numbers

interface Status {
    beaconless: boolean;
}

interface HybridGpsBody {
    satellites: Satellite[];
    tow: string;
}

/**
 * A push button payload
 */
export interface DecodedHybridGpsPayload extends DecodedPayload {
    header: Header;
    body: HybridGpsBody;
}

interface Satellite {
    satNumber: number;
    codePhase: string;
}

// Header
const ACK_INDEX = 0;
const STATUS_INDEX = 1;
const BATTERY_VOLTAGE_INDEX = 2;
const MESSAGE_ID_INDEX = 3;
const SIZE_INDEX = 4;

// Body
const SATELLITES_INDEX = 5;
const TOW_INDEX = 25;
const INFO_INDEX = 29;

// The min and max battery voltages a LoRa tag should report, taken from the
// spec document. These values are 100x the actual values, due to limitations
// with Javascript and how they are reported (as unsigned ints)
const batteryVoltageMin = 250;
const batteryVoltageMax = 425;

/**
 * Given the voltage+status byte from a HybridGPS message, parse out just
 * the 6 least significant bits and run that number through the battery
 * voltage formula.
 *
 * If that calculated battery voltage is higher than the expected max, we
 * will log a warning and then just return the max expected voltage.
 */
export function decodeHybridGpsVoltageByte(voltageByte: number): number {
    // The LoRaWan End Node-Gateway Message Specification document contains
    // an incorrect voltage formula. The calculation used below is instead
    // taken from the NetworkServer code.
    let batteryVoltage = ((voltageByte & 0x3f) * 4 + batteryVoltageMin) / 100;

    if (batteryVoltage > batteryVoltageMax / 100) {
        batteryVoltage = batteryVoltageMax / 100;
    }

    return batteryVoltage;
}

/**
 * Extract the fields out of the status portion of the message
 */
function getStatus(status: number): Status {
    return {
        beaconless: Boolean(status & 0x80)
    };
}

/**
 * Decode the portion of the message with satellite information
 */
function getSats(satelliteBuffer: Buffer): Satellite[] {
    const NUM_TOTAL_SATELLITES = 32;

    const svMask = satelliteBuffer.readUInt32LE(0);

    const svBuffer = satelliteBuffer.slice(NUM_TOTAL_SATELLITES / 8);

    const sats: Satellite[] = [];

    for (let i = 0; i < NUM_TOTAL_SATELLITES; i++) {
        if ((svMask >> i) % 2) {
            sats.push({
                satNumber: i,
                codePhase: svBuffer.readUInt16LE(sats.length).toString(16)
            });
        }
    }

    if (sats.length > 8) {
        throw new Error('Error');
    }

    return sats;
}

/**
 * Decodes Push Button payload messages
 */
export function decoder(payloadBuffer: Buffer): DecodedHybridGpsPayload {
    const header: Header = {
        ack: payloadBuffer.readUInt8(ACK_INDEX).toString(16).padEnd(2, '0'),
        statusBeaconless: getStatus(payloadBuffer.readUInt8(STATUS_INDEX)).beaconless.toString(),
        batteryVoltage: decodeHybridGpsVoltageByte(payloadBuffer.readUInt8(BATTERY_VOLTAGE_INDEX)),
        messageId: payloadBuffer.readUInt8(MESSAGE_ID_INDEX).toString(16).padStart(2, '0'),
        size: payloadBuffer.readUInt8(SIZE_INDEX).toString(16).padStart(2, '0')
    };

    const gpsErr: boolean = Boolean(payloadBuffer.readUInt8(INFO_INDEX) & 0x80);
    if (gpsErr) {
        throw new Error('GPS Error');
    }

    const isTowSet = Boolean(payloadBuffer.readUInt8(INFO_INDEX) & 0x40);

    const body: HybridGpsBody = {
        satellites: getSats(payloadBuffer.slice(SATELLITES_INDEX, INFO_INDEX)),
        tow: isTowSet ? payloadBuffer.readUInt32LE(TOW_INDEX).toString(16) : undefined
    };

    return {
        header,
        body
    };

}
