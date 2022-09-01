# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

az login --service-principal -u $CLIENT_ID -p=$CLIENT_SECRET --tenant $TENANT_ID
python manage.py runserver 0.0.0.0:8000 --noreload