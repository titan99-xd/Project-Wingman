classDiagram
    direction LR
    class User {
        +String name
        +String email
        +Enum role
        +String tokenIdentifier
    }

    class Patient {
        +String name
        +Int age
        +Enum sex
        +String medicalHistory
        +String roomNumber
        +Boolean active
    }

    class Medication {
        +String name
        +String dosage
        +String frequency
    }

    class Shift {
        +DateTime startTime
        +DateTime endTime
        +Enum status
        +Object checkInDetails
        +verifyGeofence(lat, lng)
    }

    class Assignment {
        +Int tasksCompleted
        +Int totalTasks
    }

    class VitalSign {
        +Enum type
        +String value
        +String unit
        +DateTime timestamp
    }

    class AuditLog {
        +String action
        +String targetId
        +DateTime timestamp
        +JSON metadata
    }

    User "1" -- "*" Shift : assigned_to
    Patient "1" -- "*" Medication : prescribed
    Shift "1" -- "*" Assignment : manages
    Patient "1" -- "*" Assignment : assigned_in
    Patient "1" -- "*" VitalSign : has
    User "1" -- "*" VitalSign : records
    User "1" -- "*" AuditLog : performs