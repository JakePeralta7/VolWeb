from django.urls import path
from .views import (
    EvidencePluginsView,
    PluginArtefactsView,
    TimelinerArtefactsView,
    TimelinerTask,
    HandlesTask,
    ProcessDumpPslistTask,
    ProcessDumpMapsTask,
    FileDumpTask,
    TasksApiView,
    EnrichedProcessView,
    RestartAnalysisTask,
)

urlpatterns = [
    path(
        "evidence/<int:evidence_id>/plugins/",
        EvidencePluginsView.as_view(),
        name="evidence-plugins",
    ),
    path(
        "evidence/<int:evidence_id>/plugin/<str:plugin_name>/",
        PluginArtefactsView.as_view(),
        name="evidence-plugin-artefacts",
    ),
    path(
        "evidence/<int:evidence_id>/plugin/<str:plugin_name>/artefacts/",
        TimelinerArtefactsView.as_view(),
    ),
    path("evidence/tasks/timeliner/", TimelinerTask.as_view()),
    path("evidence/tasks/handles/", HandlesTask.as_view()),
    path("evidence/tasks/dump/process/pslist/", ProcessDumpPslistTask.as_view()),
    path("evidence/tasks/dump/process/maps/", ProcessDumpMapsTask.as_view()),
    path("evidence/tasks/dump/file/", FileDumpTask.as_view()),
    path("evidence/<int:evidence_id>/tasks/", TasksApiView.as_view()),
    path(
        "evidence/<int:evidence_id>/process/<int:pid>/enriched/",
        EnrichedProcessView.as_view(),
    ),
    path("evidence/tasks/restart/", RestartAnalysisTask.as_view()),
]
