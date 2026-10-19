// PrimeVue's Password marks its input as a popup trigger (aria-haspopup, aria-expanded) even without the strength
// meter, and those attributes aren't allowed on a password field. `inputProps` is applied last, so setting them to
// undefined removes them. Use as `:inputProps="passwordInputProps({ 'aria-describedby': ... })"`.
export function passwordInputProps(props = {}) {
    return { 'aria-haspopup': undefined, 'aria-expanded': undefined, ...props };
}
