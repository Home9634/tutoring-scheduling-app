// src/db/seedData.js

export const SEED_DATA = {
  students: [
    // { id: "student_alice", name: "Alice Wo", status: "active" },
    // { id: "student_bob", name: "Bob Tan", status: "active" }
  ],
  schedules: [
    { 
      id: "sched_alice", 
      student_id: "student_alice", 
      day_of_week: 0, // Sunday
      start_time: "15:30", 
      end_time: "16:30" 
    },
    { 
      id: "sched_bob", 
      student_id: "student_bob", 
      day_of_week: 2, // Tuesday
      start_time: "16:00", 
      end_time: "17:00" 
    }
  ],
  classes: [
    {
        "id": "class_alice_jun"
    }
    // --- Alice's Classes ---
    // Completed class
    // {
    //   id: "class_alice_jul5",
    //   student_id: "student_alice",
    //   scheduled_at: "2026-07-05T15:30:00",
    //   status: "Completed",
    //   linked_to_missed_class_id: null
    // },
    // // Cancelled by Teacher (Still Pending - 4 weeks from Jul 12 is Aug 9)
    // {
    //   id: "class_alice_jul12",
    //   student_id: "student_alice",
    //   scheduled_at: "2026-07-12T15:30:00",
    //   status: "Cancelled_Teacher",
    //   linked_to_missed_class_id: null
    // },
    // // Cancelled by Parent, but RESOLVED with a completed makeup class
    // {
    //   id: "class_alice_jul19",
    //   student_id: "student_alice",
    //   scheduled_at: "2026-07-19T15:30:00",
    //   status: "Cancelled_Parent",
    //   linked_to_missed_class_id: null
    // },
    // // This is the makeup class that resolves the July 19 cancellation
    // {
    //   id: "class_alice_jul19_makeup",
    //   student_id: "student_alice",
    //   scheduled_at: "2026-07-21T15:30:00", // Scheduled date
    //   status: "Completed", // Marked as completed, resolving the July 19 class
    //   linked_to_missed_class_id: "class_alice_jul19"
    // },
    // // Upcoming standard class
    // {
    //   id: "class_alice_jul26",
    //   student_id: "student_alice",
    //   scheduled_at: "2026-07-26T15:30:00",
    //   status: "Scheduled",
    //   linked_to_missed_class_id: null
    // },

    // // --- Bob's Classes ---
    // // Completed class
    // {
    //   id: "class_bob_jul7",
    //   student_id: "student_bob",
    //   scheduled_at: "2026-07-07T16:00:00",
    //   status: "Completed",
    //   linked_to_missed_class_id: null
    // },
    // // Cancelled by Parent (Still Pending - 6 weeks from Jul 14 is Aug 25)
    // {
    //   id: "class_bob_jul14",
    //   student_id: "student_bob",
    //   scheduled_at: "2026-07-14T16:00:00",
    //   status: "Cancelled_Parent",
    //   linked_to_missed_class_id: null
    // },
    // // Expired Teacher Cancel (Teacher cancelled on June 14, now past 4 weeks)
    // {
    //   id: "class_bob_jun14",
    //   student_id: "student_bob",
    //   scheduled_at: "2026-06-14T16:00:00",
    //   status: "Cancelled_Teacher",
    //   linked_to_missed_class_id: null
    // },
    // // Upcoming standard class
    // {
    //   id: "class_bob_jul28",
    //   student_id: "student_bob",
    //   scheduled_at: "2026-07-28T16:00:00",
    //   status: "Scheduled",
    //   linked_to_missed_class_id: null
    // }
  ]
};