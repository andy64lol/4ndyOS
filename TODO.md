# Gradient Modification Plan

## Objective
Make gradients less aggressive and use closer colors like blue and purple, avoiding clashing combinations like green with red or orange with purple.

## Files to Modify
- [ ] 4ndyOS_VER_4.0.0_core.html
- [ ] apps/user.html

## Changes Needed
- Soften transitions by adding more color stops
- Replace clashing colors with harmonious ones (e.g., blue-purple)
- Reduce contrast for less aggressive appearance

## Specific Modifications
### 4ndyOS_VER_4.0.0_core.html
- Login screen gradient: Add more stops for softer transition
- Window headers: Change to blue-purple if clashing
- Theme previews: Adjust sunset and cyber themes
- Inline icon gradients: Soften calculator, clicker, etc.

### apps/user.html
- Avatar gradient: Already blue-purple, soften if needed

### apps/CyberDyneTerminal.html
- Panel header gradient: Soften black-green-black

## Testing
- Verify gradients render correctly
- Ensure no visual conflicts
- Check performance impact

## New Task: Add 5-Second Animation for Login and Logout
- Add slow 5-second animation for login transition
- Add slow 5-second animation for logout transition
- Ensure animations are smooth and not jarring
