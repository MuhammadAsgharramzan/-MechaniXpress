export type SeverityLevel = 'Minor' | 'Medium' | 'Emergency';

export interface Issue {
    problem: string;
    severity: SeverityLevel;
}

export interface Category {
    name: string;
    issues: Issue[];
}

export interface VehicleIssues {
    [vehicleType: string]: Category[];
}

export const MECHANIC_ASSIGNMENT_OPTIONS = [
    { id: 'NEARBY', label: 'Nearby Mechanic', description: 'Auto-assign nearest available mechanic' },
    { id: 'PREFERRED', label: 'Preferred Mechanic', description: 'Select from saved mechanics' },
    { id: 'EMERGENCY_SOS', label: 'Emergency SOS', description: 'Fastest available mechanic' },
    { id: 'SCHEDULE_LATER', label: 'Schedule Later', description: 'Book mechanic for future time' }
];

export const VEHICLE_ISSUES: VehicleIssues = {
    CAR: [
        {
            name: 'Engine Related',
            issues: [
                { problem: 'Car start nahi ho rahi', severity: 'Emergency' },
                { problem: 'Engine overheat ho raha hai', severity: 'Emergency' },
                { problem: 'Engine mein ajeeb awaz (knocking/clicking)', severity: 'Medium' },
                { problem: 'Check engine light on', severity: 'Medium' },
                { problem: 'Engine oil leak', severity: 'Medium' },
                { problem: 'Coolant leak', severity: 'Medium' },
                { problem: 'Timing belt failure', severity: 'Emergency' },
            ],
        },
        {
            name: 'Electrical Issues',
            issues: [
                { problem: 'Battery dead / Jump start needed', severity: 'Medium' },
                { problem: 'Headlights/tail lights kaam nahi kar rahe', severity: 'Minor' },
                { problem: 'Alternator failure', severity: 'Emergency' },
                { problem: 'Spark plug issues', severity: 'Minor' },
                { problem: 'Wiring problem / short circuit', severity: 'Medium' },
                { problem: 'Car key lost / broken in lock', severity: 'Medium' },
                { problem: 'Lock and key issue', severity: 'Minor' },
            ],
        },
        {
            name: 'Tyre Issues',
            issues: [
                { problem: 'Tyre puncture / Flat tyre', severity: 'Minor' },
                { problem: 'Tyre burst', severity: 'Emergency' },
                { problem: 'Spare tyre change', severity: 'Minor' },
                { problem: 'Tyre pressure low', severity: 'Minor' },
                { problem: 'Tyre alignment issue', severity: 'Minor' },
                { problem: 'Tyre change needed', severity: 'Minor' },
            ],
        },
        {
            name: 'Brake Issues',
            issues: [
                { problem: 'Brakes kaam nahi kar rahe', severity: 'Emergency' },
                { problem: 'Brake fluid leak', severity: 'Medium' },
                { problem: 'Brake pads worn out', severity: 'Medium' },
                { problem: 'Brake pedal soft hai', severity: 'Medium' },
                { problem: 'Hand brake issue', severity: 'Minor' },
            ],
        },
        {
            name: 'Transmission Issues',
            issues: [
                { problem: 'Clutch problem / Clutch slip', severity: 'Medium' },
                { problem: 'Gear shift nahi ho raha', severity: 'Emergency' },
                { problem: 'Transmission fluid leak', severity: 'Medium' },
                { problem: 'Car aage nahi badhti (gear mein hone ke bawajood)', severity: 'Emergency' },
            ],
        },
        {
            name: 'Cooling/AC Issues',
            issues: [
                { problem: 'AC kaam nahi kar raha', severity: 'Minor' },
                { problem: 'Car garam ho rahi hai (overheating)', severity: 'Emergency' },
                { problem: 'Radiator leak', severity: 'Medium' },
                { problem: 'Cooling fan kaam nahi kar raha', severity: 'Medium' },
                { problem: 'Water level low', severity: 'Minor' },
            ],
        },
        {
            name: 'Fuel System',
            issues: [
                { problem: 'Fuel khatam', severity: 'Minor' },
                { problem: 'Fuel pump failure', severity: 'Emergency' },
                { problem: 'Fuel line block', severity: 'Medium' },
                { problem: 'Fuel filter clogged', severity: 'Medium' },
            ],
        },
        {
            name: 'Other Issues',
            issues: [
                { problem: 'Accident / Collision damage', severity: 'Emergency' },
                { problem: 'Windshield crack/break', severity: 'Medium' },
                { problem: 'Exhaust system problem', severity: 'Minor' },
                { problem: 'Suspension issue', severity: 'Medium' },
                { problem: 'Power steering failure', severity: 'Emergency' },
                { problem: 'Car stuck in mud/sand/water', severity: 'Medium' },
            ],
        },
    ],
    BIKE: [
        {
            name: 'Engine & Starting',
            issues: [
                { problem: 'Bike start nahi ho rahi', severity: 'Emergency' },
                { problem: 'Kick start issue', severity: 'Minor' },
                { problem: 'Self start kaam nahi kar raha', severity: 'Minor' },
                { problem: 'Engine misfiring', severity: 'Medium' },
                { problem: 'Engine oil leak', severity: 'Medium' },
                { problem: 'Smoke aa rahi exhaust se', severity: 'Medium' },
                { problem: 'Engine overheating', severity: 'Emergency' },
                { problem: 'Engine seizure', severity: 'Emergency' },
            ],
        },
        {
            name: 'Electrical Issues',
            issues: [
                { problem: 'Battery dead', severity: 'Medium' },
                { problem: 'Headlight/Indicator kaam nahi kar raha', severity: 'Minor' },
                { problem: 'Horn kaam nahi kar raha', severity: 'Minor' },
                { problem: 'Spark plug issue', severity: 'Minor' },
                { problem: 'Wiring problem', severity: 'Medium' },
                { problem: 'Meter console not working', severity: 'Minor' },
                { problem: 'Key lost / broken in lock', severity: 'Medium' },
            ],
        },
        {
            name: 'Tyre & Wheels',
            issues: [
                { problem: 'Puncture / Flat tyre', severity: 'Minor' },
                { problem: 'Tyre burst', severity: 'Emergency' },
                { problem: 'Tyre change needed', severity: 'Minor' },
                { problem: 'Wheel balancing issue', severity: 'Minor' },
                { problem: 'Rim bent', severity: 'Medium' },
            ],
        },
        {
            name: 'Chain & Transmission',
            issues: [
                { problem: 'Chain tension issue', severity: 'Minor' },
                { problem: 'Chain lubrication needed', severity: 'Minor' },
                { problem: 'Chain break', severity: 'Emergency' },
                { problem: 'Chain sprocket worn out', severity: 'Medium' },
                { problem: 'Gear shift issue', severity: 'Medium' },
                { problem: 'Clutch slippage', severity: 'Medium' },
            ],
        },
        {
            name: 'Brakes',
            issues: [
                { problem: 'Brakes kaam nahi kar rahe', severity: 'Emergency' },
                { problem: 'Brake fluid leak', severity: 'Medium' },
                { problem: 'Brake shoes/pads worn out', severity: 'Medium' },
                { problem: 'Brake disc issue', severity: 'Medium' },
            ],
        },
        {
            name: 'Clutch & Controls',
            issues: [
                { problem: 'Clutch cable break', severity: 'Medium' },
                { problem: 'Throttle cable break', severity: 'Emergency' },
                { problem: 'Accelerator cable issue', severity: 'Medium' },
                { problem: 'Brake lever broken', severity: 'Medium' },
                { problem: 'Clutch lever broken', severity: 'Medium' },
            ],
        },
        {
            name: 'Fuel System',
            issues: [
                { problem: 'Petrol khatam', severity: 'Minor' },
                { problem: 'Carburetor issue', severity: 'Medium' },
                { problem: 'Fuel line block', severity: 'Medium' },
                { problem: 'Fuel tank leak', severity: 'Emergency' },
                { problem: 'Fuel injector problem', severity: 'Medium' },
            ],
        },
        {
            name: 'Other Issues',
            issues: [
                { problem: 'Side stand break', severity: 'Minor' },
                { problem: 'Stand sensor issue', severity: 'Medium' },
                { problem: 'Silencer/db killer issue', severity: 'Minor' },
                { problem: 'Accident / Body damage', severity: 'Emergency' },
                { problem: 'Handle/mirror broken', severity: 'Minor' },
                { problem: 'Seat torn/broken', severity: 'Minor' },
                { problem: 'Bike lock jammed', severity: 'Medium' },
                { problem: 'Bike fallen / damaged', severity: 'Medium' },
                { problem: 'Pillion grabrail broken', severity: 'Minor' },
                { problem: 'Number plate lost', severity: 'Minor' },
            ],
        },
    ],
};
