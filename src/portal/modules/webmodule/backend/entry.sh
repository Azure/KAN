# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

if [[ -z $CLIENT_ID || -z $CLIENT_SECRET || -z $TENANT_ID ]]; then
    echo "Missing Azure credentials, skip Azure login."
else
    echo "Login Azure..."
    az login --service-principal -u $CLIENT_ID -p=$CLIENT_SECRET --tenant $TENANT_ID
fi

python manage.py runserver 0.0.0.0:8000 --noreload