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
 * @file Decoder for Push Button payloads
 */

import { DecodedPayload, Header } from '../interfaces';

/**
 * Counts for a single button in a push button payload
 */
export interface PushButtonCounts {
    buttonId: number;
    singlePressCount: number;
    doublePressCount: number;
    longPressCount: number;
    stuck: boolean;
}

/**
 * A decoded push button payload
 */
export interface DecodedPushButtonPayload extends DecodedPayload {
    header: Header;
    body: PushButtonCounts[];
}

const ACK_INDEX = 0;
const STATUS_INDEX = 1;
const BATTERY_VOLTAGE_INDEX = 2;
const MESSAGE_ID_INDEX = 3;
const SIZE_INDEX = 4;

const BUTTON_START_INDEX = 5;
const BUTTON_COUNT_BYTE_WIDTH = 4;
const SINGLE_PRESS_COUNT_INDEX = 0;
const DOUBLE_PRESS_COUNT_INDEX = 1;
const LONG_PRESS_COUNT_INDEX = 2;
const STUCK_FLAG_INDEX = 3;

// The min and max battery voltages a LoRa tag should report, taken from the
// spec document. These values are 100x the actual values, due to limitations
// with Javascript and how they are reported (as unsigned ints)
const batteryVoltageMin = 250;
const batteryVoltageMax = 425;

/**
 * Get the battery voltage for a sensor
 */
export function decodeBatteryVoltageByte(voltageByte: number): number {
    // tslint:disable no-magic-numbers
    // tslint:disable-next-line no-bitwise
    let batteryVoltage = ((voltageByte & 0x3f) * 4 + batteryVoltageMin) / 100;

    if (batteryVoltage > batteryVoltageMax / 100) {
        batteryVoltage = batteryVoltageMax / 100;
    }
    // tslint:enable no-magic-numbers

    return batteryVoltage;
}

/**
 * Decodes Push Button payload messages
 */
export function decoder(payloadBuffer: Buffer): DecodedPushButtonPayload {
    const header: Header = {
        ack: payloadBuffer.readUInt8(ACK_INDEX).toString(16).padEnd(2, '0'),
        status: payloadBuffer.readUInt8(STATUS_INDEX).toString(16).padStart(2, '0'),
        batteryVoltage: decodeBatteryVoltageByte(payloadBuffer.readUInt8(BATTERY_VOLTAGE_INDEX)),
        messageId: payloadBuffer.readUInt8(MESSAGE_ID_INDEX).toString(16).padStart(2, '0'),
        size: payloadBuffer.readUInt8(SIZE_INDEX).toString(16).padStart(2, '0')
    };

    const buttonEvents: PushButtonCounts[] = [];

    let id = 0;

    for (
        let bufferOffset = BUTTON_START_INDEX;
        bufferOffset < payloadBuffer.length;
        bufferOffset += BUTTON_COUNT_BYTE_WIDTH
    ) {
        buttonEvents.push({
            buttonId: id++,
            singlePressCount: payloadBuffer.readUInt8(bufferOffset + SINGLE_PRESS_COUNT_INDEX),
            doublePressCount: payloadBuffer.readUInt8(bufferOffset + DOUBLE_PRESS_COUNT_INDEX),
            longPressCount: payloadBuffer.readUInt8(bufferOffset + LONG_PRESS_COUNT_INDEX),
            stuck: payloadBuffer.readUInt8(bufferOffset + STUCK_FLAG_INDEX) === 1 ? true : false
        });
    }

    return {
        header,
        body: buttonEvents
    };

}
