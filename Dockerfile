FROM postgres:15.1

RUN apt-get update \
  && apt-get install -y postgresql-15-cron \
  && rm -rf /var/lib/apt/lists/*
  
RUN echo "shared_preload_libraries = 'pg_cron'" >> /etc/postgresql/postgresql.conf