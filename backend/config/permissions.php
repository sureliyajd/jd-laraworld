<?php

return [
    'send_emails' => [
        'label' => 'Send Emails',
        'permissions' => [
            'send emails',
            'view email logs',
            'view all email logs',
            'manage email logs',
        ],
    ],

    'task_management' => [
        'label' => 'Task Management',
        'permissions' => [
            'view all tasks',
            'view assigned tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',
            'assign tasks',
            'change task status',
            'change task priority',
            'view comments',
            'manage comments',
            'view attachments',
            'manage attachments',
        ],
    ],

    'users' => [
        'label' => 'Users',
        'permissions' => [
            'view all users',
            'view users',
            'create users',
            'edit users',
            'delete users',
        ],
    ],

    'roles_and_permissions' => [
        'label' => 'Roles and Permissions',
        'permissions' => [
            'view roles',
            'assign roles',
            'manage permissions',
        ],
    ],
];

