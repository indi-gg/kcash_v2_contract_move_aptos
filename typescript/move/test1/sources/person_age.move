module person_address::PersonAge{
    use std::debug;

    struct Person has drop{
        age: u8
    }

    #[view]
    public fun setAge(new_age: u8):u8{
        let person = Person{age: new_age};
        debug::print(&person);
        person.age
    }
}