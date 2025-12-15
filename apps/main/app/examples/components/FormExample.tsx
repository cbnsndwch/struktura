import {
    BellIcon,
    CreditCardIcon,
    DownloadIcon,
    EyeIcon,
    FileCodeIcon,
    FileIcon,
    FileTextIcon,
    FolderIcon,
    FolderOpenIcon,
    FolderSearchIcon,
    HelpCircleIcon,
    KeyboardIcon,
    LanguagesIcon,
    LayoutIcon,
    LogOutIcon,
    MailIcon,
    MonitorIcon,
    MoonIcon,
    MoreHorizontalIcon,
    MoreVerticalIcon,
    PaletteIcon,
    SaveIcon,
    SettingsIcon,
    ShieldIcon,
    SunIcon,
    UserIcon
} from 'lucide-react';
import * as React from 'react';

import {
    Button,
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    Field,
    FieldGroup,
    FieldLabel,
    Input,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea
} from '@cbnsndwch/struktura-shared-ui';

import { Example } from './ExampleWrapper.js';

const frameworks = [
    'Next.js',
    'SvelteKit',
    'Nuxt.js',
    'Remix',
    'Astro'
] as const;

export default function FormExample() {
    const [notifications, setNotifications] = React.useState({
        email: true,
        sms: false,
        push: true
    });
    const [theme, setTheme] = React.useState('light');

    return (
        <Example title="Form">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>
                        Please fill in your details below
                    </CardDescription>
                    <CardAction>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVerticalIcon />
                                    <span className="sr-only">
                                        More options
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>File</DropdownMenuLabel>
                                    <DropdownMenuItem>
                                        <FileIcon />
                                        New File
                                        <DropdownMenuShortcut>
                                            ⌘N
                                        </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <FolderIcon />
                                        New Folder
                                        <DropdownMenuShortcut>
                                            ⇧⌘N
                                        </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <FolderOpenIcon />
                                            Open Recent
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuLabel>
                                                        Recent Projects
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem>
                                                        <FileCodeIcon />
                                                        Project Alpha
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <FileCodeIcon />
                                                        Project Beta
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <MoreHorizontalIcon />
                                                            More Projects
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuPortal>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuItem>
                                                                    <FileCodeIcon />
                                                                    Project
                                                                    Gamma
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <FileCodeIcon />
                                                                    Project
                                                                    Delta
                                                                </DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuPortal>
                                                    </DropdownMenuSub>
                                                </DropdownMenuGroup>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem>
                                                        <FolderSearchIcon />
                                                        Browse...
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <SaveIcon />
                                        Save
                                        <DropdownMenuShortcut>
                                            ⌘S
                                        </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <DownloadIcon />
                                        Export
                                        <DropdownMenuShortcut>
                                            ⇧⌘E
                                        </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>View</DropdownMenuLabel>
                                    <DropdownMenuCheckboxItem
                                        checked={notifications.email}
                                        onCheckedChange={checked =>
                                            setNotifications({
                                                ...notifications,
                                                email: checked === true
                                            })
                                        }
                                    >
                                        <EyeIcon />
                                        Show Sidebar
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={notifications.sms}
                                        onCheckedChange={checked =>
                                            setNotifications({
                                                ...notifications,
                                                sms: checked === true
                                            })
                                        }
                                    >
                                        <LayoutIcon />
                                        Show Status Bar
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <PaletteIcon />
                                            Theme
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuLabel>
                                                        Appearance
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuRadioGroup
                                                        value={theme}
                                                        onValueChange={setTheme}
                                                    >
                                                        <DropdownMenuRadioItem value="light">
                                                            <SunIcon />
                                                            Light
                                                        </DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="dark">
                                                            <MoonIcon />
                                                            Dark
                                                        </DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="system">
                                                            <MonitorIcon />
                                                            System
                                                        </DropdownMenuRadioItem>
                                                    </DropdownMenuRadioGroup>
                                                </DropdownMenuGroup>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>
                                        Account
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem>
                                        <UserIcon />
                                        Profile
                                        <DropdownMenuShortcut>
                                            ⇧⌘P
                                        </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <CreditCardIcon />
                                        Billing
                                    </DropdownMenuItem>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <SettingsIcon />
                                            Settings
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuLabel>
                                                        Preferences
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem>
                                                        <KeyboardIcon />
                                                        Keyboard Shortcuts
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <LanguagesIcon />
                                                        Language
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <BellIcon />
                                                            Notifications
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuPortal>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuGroup>
                                                                    <DropdownMenuLabel>
                                                                        Notification
                                                                        Types
                                                                    </DropdownMenuLabel>
                                                                    <DropdownMenuCheckboxItem
                                                                        checked={
                                                                            notifications.push
                                                                        }
                                                                        onCheckedChange={checked =>
                                                                            setNotifications(
                                                                                {
                                                                                    ...notifications,
                                                                                    push:
                                                                                        checked ===
                                                                                        true
                                                                                }
                                                                            )
                                                                        }
                                                                    >
                                                                        <BellIcon />
                                                                        Push
                                                                        Notifications
                                                                    </DropdownMenuCheckboxItem>
                                                                    <DropdownMenuCheckboxItem
                                                                        checked={
                                                                            notifications.email
                                                                        }
                                                                        onCheckedChange={checked =>
                                                                            setNotifications(
                                                                                {
                                                                                    ...notifications,
                                                                                    email:
                                                                                        checked ===
                                                                                        true
                                                                                }
                                                                            )
                                                                        }
                                                                    >
                                                                        <MailIcon />
                                                                        Email
                                                                        Notifications
                                                                    </DropdownMenuCheckboxItem>
                                                                </DropdownMenuGroup>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuPortal>
                                                    </DropdownMenuSub>
                                                </DropdownMenuGroup>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem>
                                                        <ShieldIcon />
                                                        Privacy & Security
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <HelpCircleIcon />
                                        Help & Support
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <FileTextIcon />
                                        Documentation
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem variant="destructive">
                                        <LogOutIcon />
                                        Sign Out
                                        <DropdownMenuShortcut>
                                            ⇧⌘Q
                                        </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldGroup>
                            <div className="grid grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="small-form-name">
                                        Name
                                    </FieldLabel>
                                    <Input
                                        id="small-form-name"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="small-form-role">
                                        Role
                                    </FieldLabel>
                                    <Select defaultValue="">
                                        <SelectTrigger id="small-form-role">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="developer">
                                                    Developer
                                                </SelectItem>
                                                <SelectItem value="designer">
                                                    Designer
                                                </SelectItem>
                                                <SelectItem value="manager">
                                                    Manager
                                                </SelectItem>
                                                <SelectItem value="other">
                                                    Other
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="small-form-framework">
                                    Framework
                                </FieldLabel>
                                <Combobox items={frameworks}>
                                    <ComboboxInput
                                        id="small-form-framework"
                                        placeholder="Select a framework"
                                        required
                                    />
                                    <ComboboxContent>
                                        <ComboboxEmpty>
                                            No frameworks found.
                                        </ComboboxEmpty>
                                        <ComboboxList>
                                            {item => (
                                                <ComboboxItem
                                                    key={item}
                                                    value={item}
                                                >
                                                    {item}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="small-form-comments">
                                    Comments
                                </FieldLabel>
                                <Textarea
                                    id="small-form-comments"
                                    placeholder="Add any additional comments"
                                />
                            </Field>
                            <Field orientation="horizontal">
                                <Button type="submit">Submit</Button>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </Example>
    );
}
