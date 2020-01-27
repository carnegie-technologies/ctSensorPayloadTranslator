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

// The format of the header of a message sent from a ctSensor
export interface Header {
    ack: string;
    status?: string;
    statusBeaconless?: string;
    batteryVoltage: number;
    messageId: string;
    size: string;
}

// The format of the decoded payload of a message from a ctSensor
export interface DecodedPayload {
    header: Header;

    // tslint:disable-next-line:no-any
    body: any;
}
